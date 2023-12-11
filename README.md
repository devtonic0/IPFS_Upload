# IPFS_Upload
A simple script to upload a collection to ipfs, and retain a common url (eg. https://{CID}.ipfs.nftstorage.link/0.json)

This script allows you to upload your collection to ipfs and retain a common url, the problem with nft.storage is it is not possible to share a common url while still adding that image url to the json file. the only way to counter this while still retaining free storage is to upload the images twice. 

this script simply uploads the images, and then edits the json files to include this image uri. once this is complete it uploads the entire directory and creates a csv of the uris created. 

step 1: go to nft.storage and create an account
step 2: click the api tab and get your api key
step 3: clone the repo and add your api key to upload.js
step 4: from this projects root directory run yarn install (or npm, whatever you prefer)
step 5: run yarn start (again, or npm)

this process may take a while, and maximum directory size is 31gb. 
