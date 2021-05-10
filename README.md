# Amazon IVS Virtual Q&A web demo
A demo web application intended as an educational tool for demonstrating how Amazon IVS, in conjunction with other AWS services, can be used to build a interactive virtual Q&A experience.

**This project is intended for education purposes only and not for production usage.**

This is a serverless web application, leveraging [AWS Lambda](https://aws.amazon.com/lambda/), [Amazon API Gateway](https://aws.amazon.com/api-gateway/), and [Amazon DynamoDB](https://aws.amazon.com/dynamodb/). The web user interface is a [single page application](https://en.wikipedia.org/wiki/Single-page_application) built using [responsive web design](https://en.wikipedia.org/wiki/Responsive_web_design) frameworks and techniques, producing a native app-like experience tailored to the user's device.


## Getting Started
***IMPORTANT NOTE:** Deploying this demo application in your AWS account will create and consume AWS resources, which will cost money.*

To get the demo running in your own AWS account, follow these instructions.
1. If you do not have an AWS account, please see [How do I create and activate a new Amazon Web Services account?](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/)
2. Have `aws-cli`, `sam-cli`, `node`, and `yarn` installed.
3. Create an Amazon IVS channel via the [Amazon IVS console](https://console.aws.amazon.com/ivs/channels/create)
4. Download and install Open Broadcaster Software (OBS) from [obsproject.com](https://obsproject.com/)
5. Deploy the backend and store the backend metadata for the frontend. In the root directory, run these commands.
	```
	aws s3 mb s3://YOUR_S3_BUCKET_NAME
	
	sam package \
	    --template-file template.yaml \
	    --output-template-file packaged.yaml \
	    --s3-bucket YOUR_S3_BUCKET_NAME
	
	sam deploy \
	    --template-file packaged.yaml \
	    --stack-name YOUR_STACK_NAME \
	    --capabilities CAPABILITY_IAM \
	    --parameter-overrides Stage=YOUR_STAGE_NAME
	    --region YOUR_REGION
	
	aws cloudformation describe-stacks \ 
	    --stack-name YOUR_STACK_NAME \
	    --query 'Stacks[].Outputs' > frontend/src/backendStackOutput.json
	```
6. Build the frontend. In the root directory, run these commands.
	```
	cd frontend
	yarn build
	```
7. The frontend build is now in `frontend/build` directory. Host this in a S3 bucket configured for frontend hosting. The hosted live frontend will now work with any channel you create and stream you broadcast.

8. Build the frontend url for a specific channel. Get the `arn` and `playbackUrl` of your Amazon IVS channel. Base64 encode the two values and build the url like so.
	```
	YOUR_BASE_URL_HERE?channel=YOUR_BASE_64_ENCODED_ARN&playback=YOUR_BASE_64_ENCODED_PLAYBACK_URL
	```
	Example url with:
	* base url: `https://www.myqapoll.com`
	* arn: `arn:aws:ivs:us-west-2:318639227069:channel/yrBv9H164gUU`
	* playbackUrl: `https://12887efb1942.us-west-2.playback.live-video.net/api/video/v1/us-west-2.318639227069.channel.yrBv9H164gUU.m3u8`

	```
	https://www.myqapoll.com?channel=YXJuOmF3czppdnM6dXMtd2VzdC0yOjMxODYzOTIyNzA2OTpjaGFubmVsL3lyQnY5SDE2NGdVVQ==&playback=aHR0cHM6Ly8xMjg4N2VmYjE5NDIudXMtd2VzdC0yLnBsYXliYWNrLmxpdmUtdmlkZW8ubmV0L2FwaS92aWRlby92MS91cy13ZXN0LTIuMzE4NjM5MjI3MDY5LmNoYW5uZWwueXJCdjlIMTY0Z1VVLm0zdTg=
	```

## Amazon IVS
* [Amazon IVS Amazon Interactive Video Service](https://aws.amazon.com/ivs/) is a managed live streaming solution that is quick and easy to set up, and ideal for creating interactive video experiences. Simply send your live streams to Amazon IVS and the service does everything you need to make ultra-low latency live video available to any viewer around the world, letting you focus on building interactive experiences alongside the live video. [Learn more](https://aws.amazon.com/ivs/).
* [Amazon IVS docs](https://docs.aws.amazon.com/ivs/)
* [User Guide](https://docs.aws.amazon.com/ivs/latest/userguide/)
* [API Reference](https://docs.aws.amazon.com/ivs/latest/APIReference/)
* [Learn more about Amazon IVS on IVS.rocks](https://ivs.rocks/)
* [View more demos like this](https://ivs.rocks/examples)

#### Known Issues
* The application was written for demonstration purposes and not for production use.
* No TTL deletion on dynamodb tables.
* Currently only tested in the us-west-2 (Oregon) region. Additional regions may be supported depending on service availability.

#### License
This sample code is made available under a modified MIT license. See the LICENSE file.
