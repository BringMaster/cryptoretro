import { verifyMessage } from 'viem';

const SIGN_MESSAGE = 'Sign this message to verify your ownership of this wallet and manage your watchlist on RetroToken.';

export const verifySignature = async (signature: string, address: string): Promise<boolean> => {
  try {
    console.log('Verifying signature:', {
      signature,
      address,
      message: SIGN_MESSAGE
    });
    
    const signatureWithPrefix = signature.startsWith('0x') ? signature : `0x${signature}`;
    
    const recoveredAddress = await verifyMessage({
      message: SIGN_MESSAGE,
      signature: signatureWithPrefix as `0x${string}`,
      address: address as `0x${string}`,
    });
    
    const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();
    console.log('Signature verification result:', {
      recoveredAddress,
      providedAddress: address,
      isValid
    });
    
    return isValid;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

export const getSignMessage = (): string => SIGN_MESSAGE;
