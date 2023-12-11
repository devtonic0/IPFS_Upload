const fs = require('fs-extra');
const path = require('path');
const { NFTStorage, Blob, File } = require('nft.storage');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const cliProgress = require('cli-progress');

const NFT_STORAGE_TOKEN = 'YOUR_API_KEY';

const directoryPath = './upload'; 

const csvWriter = createCsvWriter({
  path: 'nft-data.csv',
  header: [
    { id: 'fileName', title: 'FILE_NAME' },
    { id: 'directoryCidUrl', title: 'DIRECTORY_CID_URL' },
    { id: 'metadataCidUrl', title: 'METADATA_CID_URL' }
  ]
});

const imageProgressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
const jsonProgressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_grey);

// Function to upload a file and return its CID
async function uploadFile(storage, fileContent) {
  const blob = new Blob([fileContent]);
  return await storage.storeBlob(blob);
}

// Main function to handle the upload process
async function uploadImagesAndMetadata(directoryPath) {
  const storage = new NFTStorage({ token: NFT_STORAGE_TOKEN });
  const fileNames = await fs.readdir(directoryPath);
  const imageFileNames = fileNames.filter(fileName => fileName.endsWith('.png')); // Adjust if using different image extensions
  const csvRecords = [];

  // Step 1: Upload images and get their CIDs
  imageProgressBar.start(imageFileNames.length, 0);
  for (const fileName of imageFileNames) {
    const filePath = path.join(directoryPath, fileName);
    const fileContent = await fs.readFile(filePath);
    const imageCid = await uploadFile(storage, fileContent);
    const imageCidUrl = `https://${imageCid}.ipfs.nftstorage.link`;
    csvRecords.push({ fileName, imageCidUrl, directoryCidUrl: '', metadataCidUrl: '' });
    imageProgressBar.increment();
  }
  imageProgressBar.stop();

  // Step 2: Update metadata JSON files with image URLs
  jsonProgressBar.start(imageFileNames.length, 0);
  for (const record of csvRecords) {
    const jsonFileName = record.fileName.replace('.png', '.json'); // Adjust for your file naming
    const jsonFilePath = path.join(directoryPath, jsonFileName);
    let metadata = await fs.readJson(jsonFilePath);
    metadata.image = record.imageCidUrl;
    await fs.writeJson(jsonFilePath, metadata);
    jsonProgressBar.increment();
  }
  jsonProgressBar.stop();

  // Step 3: Upload the entire directory to get a single directory CID
  const directoryFiles = await Promise.all(
    fileNames.map(async (fileName) => {
      const filePath = path.join(directoryPath, fileName);
      return new File([await fs.readFile(filePath)], fileName);
    })
  );
  const directoryCid = await storage.storeDirectory(directoryFiles);
  const directoryCidUrl = `https://${directoryCid}.ipfs.nftstorage.link/`;

  // Update CSV records with directory CID URLs
  for (const record of csvRecords) {
    record.directoryCidUrl = directoryCidUrl + record.fileName;
    const jsonFileName = record.fileName.replace('.png', '.json');
    record.metadataCidUrl = directoryCidUrl + jsonFileName;
  }

  // Write to CSV file
  await csvWriter.writeRecords(csvRecords);
  console.log('CSV file has been written.');
}

uploadImagesAndMetadata(directoryPath);

