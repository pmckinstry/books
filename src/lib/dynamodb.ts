import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// DynamoDB configuration
const dynamoConfig: any = {
  region: process.env.AWS_REGION || 'us-east-1'
};

// For local development, use DynamoDB Local
if (process.env.DYNAMODB_LOCAL === 'true') {
  dynamoConfig.endpoint = 'http://localhost:8000';
  dynamoConfig.credentials = {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  };
  console.log('🔧 Using DynamoDB Local configuration');
} else {
  // For AWS, use real credentials
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    dynamoConfig.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };
    console.log('☁️ Using AWS DynamoDB configuration with access keys');
  } else if (process.env.AWS_PROFILE) {
    // Use AWS profile if no access keys provided
    console.log('☁️ Using AWS DynamoDB configuration with profile:', process.env.AWS_PROFILE);
  } else {
    // Use default AWS credentials (IAM roles, etc.)
    console.log('☁️ Using AWS DynamoDB configuration with default credentials');
  }
}

// Create DynamoDB client
export const dynamoClient = new DynamoDBClient(dynamoConfig);

// Create document client for easier operations
export const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Table names
export const TABLES = {
  USERS: 'users',
  BOOKS: 'books',
  GENRES: 'genres',
  USER_BOOK_ASSOCIATIONS: 'user_book_associations',
  READING_LISTS: 'reading_lists',
  READING_LIST_BOOKS: 'reading_list_books'
} as const;

// Table schemas for local development
export const TABLE_SCHEMAS = {
  [TABLES.USERS]: {
    TableName: TABLES.USERS,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'username', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'username-index',
        KeySchema: [
          { AttributeName: 'username', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  
  [TABLES.BOOKS]: {
    TableName: TABLES.BOOKS,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'title', AttributeType: 'S' },
      { AttributeName: 'author', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'title-author-index',
        KeySchema: [
          { AttributeName: 'title', KeyType: 'HASH' },
          { AttributeName: 'author', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  
  [TABLES.GENRES]: {
    TableName: TABLES.GENRES,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'name', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'name-index',
        KeySchema: [
          { AttributeName: 'name', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
        }
  },
  
  [TABLES.USER_BOOK_ASSOCIATIONS]: {
    TableName: TABLES.USER_BOOK_ASSOCIATIONS,
    KeySchema: [
      { AttributeName: 'user_id', KeyType: 'HASH' },
      { AttributeName: 'book_id', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'user_id', AttributeType: 'S' },
      { AttributeName: 'book_id', AttributeType: 'S' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  
  [TABLES.READING_LISTS]: {
    TableName: TABLES.READING_LISTS,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'user_id', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'user_id-index',
        KeySchema: [
          { AttributeName: 'user_id', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  
  [TABLES.READING_LIST_BOOKS]: {
    TableName: TABLES.READING_LIST_BOOKS,
    KeySchema: [
      { AttributeName: 'reading_list_id', KeyType: 'HASH' },
      { AttributeName: 'book_id', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'reading_list_id', AttributeType: 'S' },
      { AttributeName: 'book_id', AttributeType: 'S' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  }
};

export default docClient;
