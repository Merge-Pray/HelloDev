import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

const getKey = () => {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable not set');
  }
  return Buffer.from(process.env.ENCRYPTION_KEY, 'base64');
};

export const generateKey = () => {
  return crypto.randomBytes(32).toString('base64');
};

export const encrypt = (plaintext) => {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(Buffer.from('hellodev-chat', 'utf8'));
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encryptedContent: encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64')
  };
};

export const decrypt = ({ encryptedContent, iv, authTag }) => {
  const key = getKey();
  const ivBuffer = Buffer.from(iv, 'base64');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
  decipher.setAAD(Buffer.from('hellodev-chat', 'utf8'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  
  let decrypted = decipher.update(encryptedContent, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

export const batchDecrypt = (messages) => {
  return messages.map(msg => {
    const decryptedContent = decrypt({
      encryptedContent: msg.encryptedContent,
      iv: msg.iv,
      authTag: msg.authTag
    });
    
    return {
      ...msg.toObject(),
      content: decryptedContent
    };
  });
};