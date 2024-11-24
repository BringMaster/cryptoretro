import { verifyMessage } from 'viem';

const SIGN_MESSAGE = 'Sign this message to verify your ownership of this wallet and manage your watchlist on RetroToken.';

export const verifySignature = async (signature: string, address: string): Promise<boolean> => {
  try {
    console.log('Verifying signature:', {
      signature,
      address,
      message: SIGN_MESSAGE
    });
    const signatureWithPrefix = signature.startsWith('0x') ? signature as `0x${string}` : `0x${signature}` as `0x${string}`;
    const recoveredAddress: string = await verifyMessage({
      message: SIGN_MESSAGE,
      signature: signatureWithPrefix,
      address,
    });
    const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();
    console.log('Signature verification result:', {
      recoveredAddress,
      providedAddress: address,
      isValid
    });
    return isValid;
  } catch (error) {
    console.error('Error verifying signature:', {
      error,
      signature,
      address,
      message: SIGN_MESSAGE
    });
    return false;
  }
};

export const getSignMessage = () => SIGN_MESSAGE;
