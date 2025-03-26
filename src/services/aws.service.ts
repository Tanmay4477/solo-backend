import AWS from 'aws-sdk';
import { randomUUID } from 'crypto';
import config from '../config';
import { ApiError } from '../middlewares/error.middleware';
import { generateUniqueFilename, getContentType } from '../utils/file-utils';

// Configure AWS SDK
AWS.config.update({
  region: config.aws.region,
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey
});

// Initialize S3 client
const s3 = new AWS.S3();

// Initialize MediaConvert client
const mediaConvert = new AWS.MediaConvert({
  apiVersion: '2017-08-29',
  endpoint: process.env.AWS_MEDIACONVERT_ENDPOINT
});

// Initialize CloudFront client
const cloudfront = new AWS.CloudFront();

/**
 * AWS Service for interacting with AWS services
 */
export class AwsService {
  /**
   * Upload a file to S3
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - Original file name
   * @param {string} folder - Destination folder in S3
   * @param {string} contentType - File content type
   * @returns {Promise<{key: string, url: string}>} File key and URL
   */
  static async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    folder: string,
    contentType: string
  ): Promise<{ key: string; url: string }> {
    // Generate unique file name
    const uniqueFileName = generateUniqueFilename(fileName);
    const key = `${folder}/${uniqueFileName}`;
    
    // S3 upload parameters
    const params = {
      Bucket: config.aws.s3Bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType || getContentType(fileName),
      ACL: 'public-read' // Make the file publicly accessible
    };
    
    try {
      // Upload to S3
      await s3.upload(params).promise();
      
      // Generate URL
      let url: string;
      if (config.aws.cloudfrontDomain) {
        // Use CloudFront URL if available
        url = `https://${config.aws.cloudfrontDomain}/${key}`;
      } else {
        // Use S3 URL
        url = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
      }
      
      return { key, url };
    } catch (error) {
      throw new ApiError(`Failed to upload file: ${error.message}`, 500);
    }
  }
  
  /**
   * Delete a file from S3
   * @param {string} key - S3 object key
   * @returns {Promise<boolean>} Success or failure
   */
  static async deleteFile(key: string): Promise<boolean> {
    const params = {
      Bucket: config.aws.s3Bucket,
      Key: key
    };
    
    try {
      await s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      throw new ApiError(`Failed to delete file: ${error.message}`, 500);
    }
  }
  
  /**
   * Get a signed URL for temporary access to a file
   * @param {string} key - S3 object key
   * @param {number} expiresIn - Expiration time in seconds (default 1 hour)
   * @returns {Promise<string>} Signed URL
   */
  static async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const params = {
      Bucket: config.aws.s3Bucket,
      Key: key,
      Expires: expiresIn
    };
    
    try {
      return s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      throw new ApiError(`Failed to generate signed URL: ${error.message}`, 500);
    }
  }
  
  /**
   * Check if a file exists in S3
   * @param {string} key - S3 object key
   * @returns {Promise<boolean>} True if exists
   */
  static async fileExists(key: string): Promise<boolean> {
    const params = {
      Bucket: config.aws.s3Bucket,
      Key: key
    };
    
    try {
      await s3.headObject(params).promise();
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw new ApiError(`Failed to check file existence: ${error.message}`, 500);
    }
  }
  
  /**
   * Create a video transcoding job
   * @param {string} inputKey - Input file S3 key
   * @param {string} outputFolder - Output folder in S3
   * @returns {Promise<string>} Job ID
   */
  static async createTranscodingJob(inputKey: string, outputFolder: string): Promise<string> {
    const inputUrl = `s3://${config.aws.s3Bucket}/${inputKey}`;
    const outputUrl = `s3://${config.aws.s3Bucket}/${outputFolder}/`;
    const jobId = randomUUID();
    
    // Define job parameters for HLS with multiple resolutions
    const params = {
      Role: process.env.AWS_MEDIACONVERT_ROLE,
      JobTemplate: process.env.AWS_MEDIACONVERT_TEMPLATE,
      Settings: {
        Inputs: [
          {
            FileInput: inputUrl
          }
        ],
        OutputGroups: [
          {
            Name: 'HLS Output',
            OutputGroupSettings: {
              Type: 'HLS_GROUP_SETTINGS',
              HlsGroupSettings: {
                SegmentLength: 6,
                MinSegmentLength: 0,
                Destination: outputUrl
              }
            },
            Outputs: [
              // 1080p output
              {
                VideoDescription: {
                  Width: 1920,
                  Height: 1080,
                  CodecSettings: {
                    Codec: 'H_264',
                    H264Settings: {
                      RateControlMode: 'QVBR',
                      QvbrSettings: {
                        QvbrQualityLevel: 9
                      },
                      FramerateDenominator: 1,
                      FramerateNumerator: 30
                    }
                  }
                },
                AudioDescriptions: [
                  {
                    CodecSettings: {
                      Codec: 'AAC',
                      AacSettings: {
                        Bitrate: 96000,
                        CodingMode: 'CODING_MODE_2_0',
                        SampleRate: 48000
                      }
                    }
                  }
                ],
                OutputSettings: {
                  HlsSettings: {
                    SegmentModifier: '_1080p'
                  }
                },
                NameModifier: '_1080p'
              },
              // 720p output
              {
                VideoDescription: {
                  Width: 1280,
                  Height: 720,
                  CodecSettings: {
                    Codec: 'H_264',
                    H264Settings: {
                      RateControlMode: 'QVBR',
                      QvbrSettings: {
                        QvbrQualityLevel: 8
                      },
                      FramerateDenominator: 1,
                      FramerateNumerator: 30
                    }
                  }
                },
                AudioDescriptions: [
                  {
                    CodecSettings: {
                      Codec: 'AAC',
                      AacSettings: {
                        Bitrate: 96000,
                        CodingMode: 'CODING_MODE_2_0',
                        SampleRate: 48000
                      }
                    }
                  }
                ],
                OutputSettings: {
                  HlsSettings: {
                    SegmentModifier: '_720p'
                  }
                },
                NameModifier: '_720p'
              },
              // 480p output
              {
                VideoDescription: {
                  Width: 854,
                  Height: 480,
                  CodecSettings: {
                    Codec: 'H_264',
                    H264Settings: {
                      RateControlMode: 'QVBR',
                      QvbrSettings: {
                        QvbrQualityLevel: 7
                      },
                      FramerateDenominator: 1,
                      FramerateNumerator: 30
                    }
                  }
                },
                AudioDescriptions: [
                  {
                    CodecSettings: {
                      Codec: 'AAC',
                      AacSettings: {
                        Bitrate: 96000,
                        CodingMode: 'CODING_MODE_2_0',
                        SampleRate: 48000
                      }
                    }
                  }
                ],
                OutputSettings: {
                  HlsSettings: {
                    SegmentModifier: '_480p'
                  }
                },
                NameModifier: '_480p'
              },
              // 360p output
              {
                VideoDescription: {
                  Width: 640,
                  Height: 360,
                  CodecSettings: {
                    Codec: 'H_264',
                    H264Settings: {
                      RateControlMode: 'QVBR',
                      QvbrSettings: {
                        QvbrQualityLevel: 6
                      },
                      FramerateDenominator: 1,
                      FramerateNumerator: 30
                    }
                  }
                },
                AudioDescriptions: [
                  {
                    CodecSettings: {
                      Codec: 'AAC',
                      AacSettings: {
                        Bitrate: 64000,
                        CodingMode: 'CODING_MODE_2_0',
                        SampleRate: 48000
                      }
                    }
                  }
                ],
                OutputSettings: {
                  HlsSettings: {
                    SegmentModifier: '_360p'
                  }
                },
                NameModifier: '_360p'
              }
            ]
          }
        ]
      },
      UserMetadata: {
        JobId: jobId
      }
    };
    
    try {
      const result = await mediaConvert.createJob(params).promise();
      return result.Job.Id;
    } catch (error) {
      throw new ApiError(`Failed to create transcoding job: ${error.message}`, 500);
    }
  }
  
  /**
   * Get transcoding job status
   * @param {string} jobId - MediaConvert job ID
   * @returns {Promise<string>} Job status
   */
  static async getTranscodingJobStatus(jobId: string): Promise<string> {
    try {
      const result = await mediaConvert.getJob({ Id: jobId }).promise();
      return result.Job.Status;
    } catch (error) {
      throw new ApiError(`Failed to get transcoding job status: ${error.message}`, 500);
    }
  }
  
  /**
   * Generate a CloudFront signed URL with watermark
   * @param {string} key - S3 object key
   * @param {string} userId - User ID for watermarking
   * @param {string} userName - User name for watermarking
   * @param {number} expiresIn - Expiration time in seconds (default 24 hours)
   * @returns {Promise<string>} Signed URL
   */
  static async getSignedUrlWithWatermark(
    key: string,
    userId: string,
    userName: string,
    expiresIn: number = 86400
  ): Promise<string> {
    if (!config.aws.cloudfrontDomain) {
      throw new ApiError('CloudFront domain not configured', 500);
    }
    
    // Create a watermark parameter
    const watermarkText = encodeURIComponent(`SoloPreneur | ${userName} | ${userId.substring(0, 8)}`);
    const watermarkParam = `watermark=${watermarkText}`;
    
    // Create a policy for the signed URL
    const policy = {
      Statement: [
        {
          Resource: `https://${config.aws.cloudfrontDomain}/${key}?${watermarkParam}`,
          Condition: {
            DateLessThan: {
              'AWS:EpochTime': Math.floor(Date.now() / 1000) + expiresIn
            }
          }
        }
      ]
    };
    
    // CloudFront signing requires a private key
    // In a real implementation, you would use the CloudFront key pair
    const signingParams = {
      url: `https://${config.aws.cloudfrontDomain}/${key}?${watermarkParam}`,
      policy: JSON.stringify(policy)
    };
    
    try {
      // This is a placeholder - you would need to implement actual CloudFront signing
      // using the AWS SDK or a library like cloudfront-private-url-signer
      const signedUrl = `https://${config.aws.cloudfrontDomain}/${key}?${watermarkParam}&Expires=${Math.floor(Date.now() / 1000) + expiresIn}&Signature=example`;
      
      return signedUrl;
    } catch (error) {
      throw new ApiError(`Failed to generate signed URL with watermark: ${error.message}`, 500);
    }
  }
  
  /**
   * Invalidate CloudFront cache for files
   * @param {string[]} paths - Paths to invalidate
   * @returns {Promise<string>} Invalidation ID
   */
  static async invalidateCache(paths: string[]): Promise<string> {
    if (!config.aws.cloudfrontDomain) {
      throw new ApiError('CloudFront domain not configured', 500);
    }
    
    const params = {
      DistributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: paths.length,
          Items: paths.map(path => path.startsWith('/') ? path : `/${path}`)
        }
      }
    };
    
    try {
      const result = await cloudfront.createInvalidation(params).promise();
      return result.Invalidation.Id;
    } catch (error) {
      throw new ApiError(`Failed to invalidate cache: ${error.message}`, 500);
    }
  }
}