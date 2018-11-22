# factom-identity-cli

## Installation

```bash
sudo npm install -g factom-identity-cli
```

## Usage

All the commands support the option `-s localhost:8088` that allows to specify the host and port of the factomd API endpoint.

### Get identity information

#### Get current efficiency and coinbase address

```bash
# Parameter: <Identity root chain ID>
$ factom-identity-cli get -s localhost:8088 888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584
```

#### Get history of efficiencies and coinbase addresses

```bash
# Parameter: <Identity root chain ID>
$ factom-identity-cli get -s localhost:8088 --history 888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584
```

### Update coinbase address

```bash
# Parameters: <Identity root chain ID> <FCT public address> <SK1 private key> <Paying private EC address>
$ factom-identity-cli update-coinbase-address -s localhost:8088 888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584 FA24PAtyZWWVAPm95ZCVpwyY6RYHeCMTiZt2v4VQAY8aBXMUZyeF sk12J1qQCjTRtnJ15bmb1iSinEvtzgQMBi5szzV793LUJQib36pvz Es3ytEKt4R55M9juC4ks7EgxQSX8BpRnM4WADthFoq7j1WgbEEGW
```

### Update efficiency

```bash
# Parameters: <Identity root chain ID> <Efficiency> <SK1 private key> <Paying private EC address>
$ factom-identity-cli update-efficiency -s localhost:8088 888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584 19.89 sk12J1qQCjTRtnJ15bmb1iSinEvtzgQMBi5szzV793LUJQib36pvz Es3ytEKt4R55M9juC4ks7EgxQSX8BpRnM4WADthFoq7j1WgbEEGW
```

### Add a coinbase cancel message

```bash
# Parameters: <Identity root chain ID> <Coinbase descriptor block height> <Coinbase descriptor index> <SK1 private key> <Paying private EC address>
$ factom-identity-cli add-coinbase-cancel -s localhost:8088 888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584 39945 4 sk12J1qQCjTRtnJ15bmb1iSinEvtzgQMBi5szzV793LUJQib36pvz Es3ytEKt4R55M9juC4ks7EgxQSX8BpRnM4WADthFoq7j1WgbEEGW
```

## Offline mode

You can use this tool to generate offline a bash script that can later be executed on a machine connected to the Internet (the scripts only require curl command to be installed). The use is mainly intended for Authority Servers operators who require maximum security. Your offline machine will need Node.js installed and this tool with all its dependencies available. You are strongly encouraged to audit the content of the generated scripts.

**Important: the scripts generated contain timestamped data. This has 2 consequences:**
* The clock of the machine you are using to generate the scripts must be on time. It is not uncommon for the clock of an offline machine to not be synced so please verify and adjust it before generating the scripts. It only needs to be accurate to the minute.
* The scripts have a limited time of validity. You must execute the scripts within 1 hour of their creation to be certain that the entries contained in them will be accepted by the network.

### To generate a script to update the coinbase address

```bash
# Parameters: <Identity root chain ID> <FCT public address> <SK1 private key> <Paying private EC address>
$ node bin/factom-identity-cli update-coinbase-address --offline -s localhost:8088 8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f FA3HZDE4MdXAthauFoA3aKYpx33U4fT2kAABmfwk7NBqyLT2zed5 sk12tdaziBoFyBHG56Ery3bPFFBDpy7Y3VymduGPfoj66cGhH4mHZrw Es3ytEKt6t5Jm9juC4kR7EgKQSX8BpRnM4WADtgFoq7j1WgbeEGW
```
A script named `update-coinbase-address.sh` is generated and avaible in the folder after successful execution. 


### To generate a script to update the efficiency

```bash
# Parameters: <Identity root chain ID> <Efficiency> <SK1 private key> <Paying private EC address> <Server Management Subchain ID>
$ node bin/factom-identity-cli update-efficiency --offline -s localhost:8088 8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f 50.1 sk12tdaziBoFyBHG56Ery3bPFFBDpy7Y3VymduGPfoj66cGhH4mHZrw Es3ytEKt6t5Jm9juC4kR7EgKQSX8BpRnM4WADtgFoq7j1WgbeEGW 8888887c01c12c72052f9c99b45782013feadb20c46ca86dc6e3a9730835848a
```
A script named `update-efficiency.sh` is generated and avaible in the folder after successful execution. 
Value of the *Server Management Subchain ID* can be found by looking at the identity root chain id in a Factom explorer: it is the value of the 3rd external id of the entry whose 2nd external id is equal to 'Register Server Management'. 

### To generate a script to add a coinbase cancel message

```bash
# Parameters: <Identity root chain ID> <Coinbase descriptor block height> <Coinbase descriptor index> <SK1 private key> <Paying private EC address> <Server Management Subchain ID>
$ node bin/factom-identity-cli add-coinbase-cancel --offline -s localhost:8088 8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f 39945 4 sk12tdaziBoFyBHG56Ery3bPFFBDpy7Y3VymduGPfoj66cGhH4mHZrw Es3ytEKt6t5Jm9juC4kR7EgKQSX8BpRnM4WADtgFoq7j1WgbeEGW 8888887c01c12c72052f9c99b45782013feadb20c46ca86dc6e3a9730835848a
```
A script named `add-coinbase-cancel.sh` is generated and avaible in the folder after successful execution. 
Value of the *Server Management Subchain ID* can be found by looking at the identity root chain id in a Factom explorer: it is the value of the 3rd external id of the entry whose 2nd external id is equal to 'Register Server Management'. 

## Run in Docker container

```
docker build -t factom-identity-cli github.com/PaulBernier/factom-identity-cli

docker run -it --rm factom-identity-cli ......
```
