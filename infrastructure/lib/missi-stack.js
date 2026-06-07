import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';

export class MissiStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // ====================
    // FRONTEND (S3 + CloudFront)
    // ====================
    
    // S3 Bucket para frontend
    const websiteBucket = new s3.Bucket(this, 'MissiFrontend', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false
      }),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'MissiDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html'
        }
      ]
    });

    // ====================
    // BACKEND (Lambda + API Gateway)
    // ====================

    // Lambda para backend
    const backendLambda = new lambda.Function(this, 'MissiBackend', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset('../backend/src'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        NODE_ENV: 'production'
      }
    });

    // Permisos para Bedrock
    backendLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: [
        `arn:aws:bedrock:${this.region}::foundation-model/us.amazon.nova-lite-v1:0`
      ]
    }));

    // API Gateway
    const api = new apigateway.RestApi(this, 'MissiApi', {
      restApiName: 'Missi API',
      description: 'API para la enfermera virtual Missi',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization']
      },
      deployOptions: {
        throttlingRateLimit: 10,
        throttlingBurstLimit: 20
      }
    });

    // Recurso /chat
    const chatResource = api.root.addResource('chat');
    chatResource.addMethod('POST', new apigateway.LambdaIntegration(backendLambda));

    // ====================
    // CI/CD PIPELINE (CodeCommit + CodePipeline + CodeBuild)
    // ====================

    // CodeCommit Repository
    const repository = new codecommit.Repository(this, 'MissiRepository', {
      repositoryName: 'missi',
      description: 'Repositorio de Missi - Enfermera Virtual'
    });

    // Artifact Buckets
    const sourceOutput = new codepipeline.Artifact('SourceOutput');
    const buildOutput = new codepipeline.Artifact('BuildOutput');

    // CodeBuild Project para Frontend
    const frontendBuild = new codebuild.PipelineProject(this, 'MissiFrontendBuild', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: 20
            },
            commands: [
              'echo "Installing frontend dependencies..."',
              'cd frontend',
              'npm install'
            ]
          },
          pre_build: {
            commands: [
              'echo "Creating .env file..."',
              `echo "VITE_API_URL=${api.url}" > .env`
            ]
          },
          build: {
            commands: [
              'echo "Building frontend..."',
              'npm run build',
              'echo "Build completed"'
            ]
          }
        },
        artifacts: {
          'base-directory': 'frontend/dist',
          files: ['**/*']
        }
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.SMALL
      }
    });

    // CodeBuild Project para Backend
    const backendBuild = new codebuild.PipelineProject(this, 'MissiBackendBuild', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: 20
            },
            commands: [
              'echo "Installing backend dependencies..."',
              'cd backend',
              'npm install'
            ]
          },
          build: {
            commands: [
              'echo "Backend build completed (no compilation needed)"'
            ]
          }
        },
        artifacts: {
          'base-directory': 'backend',
          files: ['src/**/*', 'package.json']
        }
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.SMALL
      }
    });

    // Pipeline
    const pipeline = new codepipeline.Pipeline(this, 'MissiPipeline', {
      pipelineName: 'MissiDeploymentPipeline',
      restartExecutionOnUpdate: true
    });

    // Stage 1: Source
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new codepipeline_actions.CodeCommitSourceAction({
          actionName: 'CodeCommit_Source',
          repository: repository,
          branch: 'main',
          output: sourceOutput
        })
      ]
    });

    // Stage 2: Build
    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'Frontend_Build',
          project: frontendBuild,
          input: sourceOutput,
          outputs: [buildOutput]
        }),
        new codepipeline_actions.CodeBuildAction({
          actionName: 'Backend_Build',
          project: backendBuild,
          input: sourceOutput
        })
      ]
    });

    // Stage 3: Deploy Frontend
    pipeline.addStage({
      stageName: 'DeployFrontend',
      actions: [
        new codepipeline_actions.S3DeployAction({
          actionName: 'S3_Deploy',
          bucket: websiteBucket,
          input: buildOutput,
          runOrder: 1
        }),
        new codepipeline_actions.LambdaInvokeAction({
          actionName: 'InvalidateCloudFront',
          lambda: new lambda.Function(this, 'InvalidateCF', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromInline(`
              const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');
              const client = new CloudFrontClient();
              
              exports.handler = async (event) => {
                const command = new CreateInvalidationCommand({
                  DistributionId: '${distribution.distributionId}',
                  InvalidationBatch: {
                    CallerReference: Date.now().toString(),
                    Paths: {
                      Quantity: 1,
                      Items: ['/*']
                    }
                  }
                });
                
                await client.send(command);
                return { statusCode: 200, body: 'Invalidation created' };
              };
            `),
            timeout: cdk.Duration.minutes(1),
            initialPolicy: [
              new iam.PolicyStatement({
                actions: ['cloudfront:CreateInvalidation'],
                resources: [`arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`]
              })
            ]
          }),
          runOrder: 2
        })
      ]
    });

    // ====================
    // OUTPUTS
    // ====================

    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'URL del sitio web',
      exportName: 'MissiWebsiteURL'
    });

    new cdk.CfnOutput(this, 'ApiURL', {
      value: api.url,
      description: 'URL de la API',
      exportName: 'MissiApiURL'
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: websiteBucket.bucketName,
      description: 'Nombre del bucket S3',
      exportName: 'MissiBucketName'
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'ID de CloudFront Distribution',
      exportName: 'MissiDistributionId'
    });

    new cdk.CfnOutput(this, 'RepositoryCloneUrlHttp', {
      value: repository.repositoryCloneUrlHttp,
      description: 'URL HTTP para clonar el repositorio',
      exportName: 'MissiRepositoryUrl'
    });

    new cdk.CfnOutput(this, 'PipelineConsoleUrl', {
      value: `https://console.aws.amazon.com/codesuite/codepipeline/pipelines/${pipeline.pipelineName}/view`,
      description: 'URL de la consola del pipeline',
      exportName: 'MissiPipelineUrl'
    });
  }
}

// App
const app = new cdk.App();
new MissiStack(app, 'MissiStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});
