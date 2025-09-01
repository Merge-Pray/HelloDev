import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (token) => {
  try {
    console.log('Verifying Google token with client ID:', process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing');
    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    console.log('Token verification successful:', {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture ? 'Present' : 'Missing',
      email_verified: payload.email_verified
    });
    
    return {
      success: true,
      data: {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified
      }
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const exchangeCodeForUserInfo = async (code) => {
  try {
    console.log('Exchanging authorization code for user info...');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/google/callback.html`
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Tokens received:', { 
      access_token: tokens.access_token ? 'Present' : 'Missing',
      id_token: tokens.id_token ? 'Present' : 'Missing'
    });
    
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();
    
    console.log('User info received:', {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture ? 'Present' : 'Missing',
      verified_email: userInfo.verified_email
    });

    return {
      success: true,
      data: {
        googleId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        emailVerified: userInfo.verified_email
      }
    };
  } catch (error) {
    console.error('Code exchange failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
