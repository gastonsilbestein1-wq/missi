import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

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
        `arn:aws:bedrock:${this.region}::foundation-model/amazon.nova-lite-v1:0`,
        `arn:aws:bedrock:*::foundation-model/*`
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
