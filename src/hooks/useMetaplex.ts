import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState, useCallback } from "react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  mplCore,
  fetchAssetsByOwner,
  fetchAssetsByCollection,
  createCollection,
  create,
  update,
  fetchAsset,
  fetchCollection,
} from "@metaplex-foundation/mpl-core";
import {
  TransactionBuilderSendAndConfirmOptions,
  createSignerFromKeypair,
  generateSigner,
  publicKey,
  some,
  signerIdentity,
} from "@metaplex-foundation/umi";

import { clusterApiUrl } from "@solana/web3.js";
import bs58 from "bs58";
import { PinataSDK } from "pinata";

const SIGNER_KEY =
  "iiU5gUQ2oc19dZAS+oa2csDwwjfn5lYABLG4HCP7Xz2qptrRowwnheYeAGFB+vm2EWCLM2crfbFa76Ls8sO/3Q==";
const SIGNER_ADDRESS = "CV9soFF5eh6yX7f1NDKGXVe23drPKmja5sFBjzZKUMwz";
const PINATA_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkZWE3N2VkYS1kZTEyLTQ4NTItYThlNi04M2M3MzM0OWY1OGIiLCJlbWFpbCI6Im1qamFtZXMwMDZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjE2NWI3NTFkM2QxODRlNTYzY2ZlIiwic2NvcGVkS2V5U2VjcmV0IjoiNGI5ZjgwOGYzZDEzNzFhODA3MjgxYTYzZDEyODc1MGVkOTc4YzEzMzQxNDA0NjUwNDhlYTFmMDA5MjczNjIzNCIsImV4cCI6MTc4MTQzMTAxNH0.DZmtqR-UF7XfB9PHXdhYtIKgr90ohI2bVyBHprmp74M";

const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: import.meta.env.VITE_GATEWAY_URL,
});

type MintData = {
  address: string;
  metaplexLink: string;
  solScanLink: string;
};

export const useMetaplex = () => {
  const { connection } = useConnection();
  const { wallet, publicKey: walletPublicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const [collectionAddress, setCollectionAddress] = useState<string | null>(
    null
  );

  const getUmi = useCallback(() => {
    if (!walletPublicKey) return null;
    if (!wallet || !wallet.adapter?.connected) {
      throw new Error("Wallet not connected properly.");
    }
    const umi = createUmi(clusterApiUrl("devnet"))
      .use(walletAdapterIdentity(wallet?.adapter))
      .use(mplCore());

    return umi;
  }, [connection, walletPublicKey]);

  const getSigner = () => {
    const umi = getUmi();
    if (!umi) throw new Error("Umi not initialized");
    const secret1 = new Uint8Array(Buffer.from(SIGNER_KEY, "base64"));
    const myKeypair1 = umi.eddsa.createKeypairFromSecretKey(secret1);
    const collectionSigner1 = createSignerFromKeypair(umi, myKeypair1);
    umi.use(signerIdentity(collectionSigner1));

    const signer = generateSigner(umi);
    const myKeypair = umi.eddsa.generateKeypair();
    const keypair = createSignerFromKeypair(umi, myKeypair);
    console.log("signer", signer);
    console.log("keypair", keypair);
  };

  const uploadFileToIpfs = async (file: File) => {
    if (!file) return Error("now file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      //   setUploadStatus('Getting upload URL...')
      const urlResponse = await fetch(
        `https://api.pinata.cloud/pinning/pinFileToIPFS`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${PINATA_JWT}`,
          },
          body: formData,
        }
      );
      const data = await urlResponse.json();
      console.log(data);
      //   setUploadStatus('Uploading file...')

      const upload = await pinata.upload.public.file(file).url(data.url);

      if (upload.cid) {
        const ipfsLink = await pinata.gateways.public.convert(upload.cid);
        console.log(ipfsLink);

        return ipfsLink;
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
      //   setUploadStatus(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  };

  const mintNft = useCallback(
    async (file: File): Promise<MintData | undefined> => {
      if (!walletPublicKey) throw new Error("Wallet not connected");
      const umi = getUmi();
      if (!umi) throw new Error("Umi not initialized");
      const secret1 = new Uint8Array(
        Buffer.from(
          "iiU5gUQ2oc19dZAS+oa2csDwwjfn5lYABLG4HCP7Xz2qptrRowwnheYeAGFB+vm2EWCLM2crfbFa76Ls8sO/3Q==",
          "base64"
        )
      );
      console.log("seceret created");
      const myKeypair1 = umi.eddsa.createKeypairFromSecretKey(secret1);
      const collectionSigner1 = createSignerFromKeypair(umi, myKeypair1);
      umi.use(signerIdentity(collectionSigner1));
      setIsLoading(true);

      console.log(file);
      try {
        const assetSigner = generateSigner(umi);

        const filLink = await uploadFileToIpfs(file);
        if (filLink && typeof filLink === "string") {
          const tx = await create(umi, {
            name: `Clip Mint Export - 3`,
            uri: await uploadMetadata(filLink),
            asset: assetSigner,
            owner: publicKey(walletPublicKey.toString()),
            plugins: [
              {
                type: "TransferDelegate",
                authority: {
                  type: "Address",
                  address: publicKey(SIGNER_ADDRESS),
                },
              },
              {
                type: "UpdateDelegate",
                authority: {
                  type: "Address",
                  address: publicKey(SIGNER_ADDRESS),
                },
                additionalDelegates: [publicKey(SIGNER_ADDRESS)],
              },
            ],
          }).sendAndConfirm(umi, {
            confirm: { commitment: "finalized" },
          });
        }
        const assetAddress = assetSigner.publicKey.toString();

        console.log("\npNFT Created");
        console.log("View Transaction on Solana Explorer");
        console.log(`https://solscan.io/token/${assetAddress}?cluster=devnet `);
        console.log("\n");
        console.log("View NFT on Metaplex Explorer");
        console.log(
          `https://explorer.solana.com/address/${assetAddress}?cluster=devnet`
        );

        const mintInfo = {
          address: assetAddress,
          metaplexLink: `https://core.metaplex.com/explorer/${assetAddress}?env=devnet`,
          solScanLink: `https://solscan.io/token/${assetAddress}?cluster=devnet`,
        };

        return ;
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    },
    [walletPublicKey, getUmi, collectionAddress]
  );

  const uploadMetadata = async (fileUrl: string): Promise<string> => {
    const metadata = {
      name: `Clip Mint Export - 3`,
      description: `Exported video from clip mint `,
      image: ``,
      properties: {
        category: "video",
        files: [
          {
            uri: fileUrl,
            type: "video/mp4",
          },
        ],
      },
    };
    return `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
  };

  return {
    mintNft,
    getSigner,
    isLoading,
    isConnected: !!walletPublicKey,
  };
};
