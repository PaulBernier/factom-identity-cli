# factom-identity-cli

## Installation

```bash
sudo npm install -g factom-identity-cli
```

## Usage

**Important note:
It is highly recommended that you run all `factom-identity-cli` commands with a leading space to prevent writing secrets (SK1 key, entry credit private key) to the command line history.**

All the commands support the option `-s http://localhost:8088/v2` that allows to specify the factomd API endpoint.

### Get identity information

#### Get current efficiency and coinbase address

```bash
# Parameter: <Identity root chain ID>
 factom-identity-cli get -s http://localhost:8088/v2 888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584
```

#### Get history of efficiencies and coinbase addresses

Use `--history` option.

```bash
# Parameter: <Identity root chain ID>
 factom-identity-cli get -s http://localhost:8088/v2 --history 888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584
```

### Update coinbase address

```bash
  --identity, --id      Identity root chain id.
  --fctaddress, --fct   Public Factoid address (starts with FA...) that will receive coinbase payouts.
  --sk1                 Secret level 1 key (starts with sk1...) to sign the update.
  --secaddress, --sec   Private EC address (starts with Es...) to pay the update.
  --offline             Generate offline a script to be excuted at a later time on a machine connected to the Internet.
```

```bash
 factom-identity-cli update-coinbase-address -s http://localhost:8088/v2 \
 --id 888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584 \
 --sk1 sk12J1qQCjTRtnJ15bmb1iSinEvtzgQMBi5szzV793LUJQib36pvz \
 --fct FA24PAtyZWWVAPm95ZCVpwyY6RYHeCMTiZt2v4VQAY8aBXMUZyeF \
 --secaddress Es3ytEKt4R55M9juC4ks7EgxQSX8BpRnM4WADthFoq7j1WgbEEGW
```

### Update efficiency

```bash
  --identity, --id      Identity root chain id.
  --efficiency, --eff   Efficiency value. Decimal number between 0 and 100.
  --sk1                 Secret level 1 key (starts with sk1...) to sign the update.
  --secaddress, --sec   Private EC address (starts with Es...) to pay the update.
  --smchainid           Identity server management subchain id (only required for offline mode).
  --offline             Generate offline a script to be excuted at a later time on a machine connected to the Internet.
```

```bash
 factom-identity-cli update-efficiency -s http://localhost:8088/v2 \
 --id 888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584 \
 --sk1 sk12J1qQCjTRtnJ15bmb1iSinEvtzgQMBi5szzV793LUJQib36pvz \
 --efficiency 19.89 \
 --secaddress Es3ytEKt4R55M9juC4ks7EgxQSX8BpRnM4WADthFoq7j1WgbEEGW
```

### Add a coinbase cancel message

```bash
  --identity, --id      Identity root chain id.
  --height              Block height containing the Admin block with the output to cancel.
  --index               Index in the coinbase descriptor of the specific output to be canceled (0 origin indexed).
  --sk1                 Secret level 1 key (starts with sk1...) to sign the update.
  --secaddress, --sec   Private EC address (starts with Es...) to pay the update.
  --smchainid           Identity server management subchain id (only required for offline mode).
  --offline             Generate offline a script to be excuted at a later time on a machine connected to the Internet.
```

```bash
 factom-identity-cli add-coinbase-cancel -s http://localhost:8088/v2 \
 --id 888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584 \
 --sk1 sk12J1qQCjTRtnJ15bmb1iSinEvtzgQMBi5szzV793LUJQib36pvz \
 --height 39945 \
 --index 4 \
 --secaddress Es3ytEKt4R55M9juC4ks7EgxQSX8BpRnM4WADthFoq7j1WgbEEGW
```

## Offline mode

You can use this tool to generate offline a bash script that can later be executed on a machine connected to the Internet (the scripts only require curl command to be installed). The use is mainly intended for Authority Servers operators who require maximum security. Your offline machine will need Node.js installed and this tool with all its dependencies available. You are strongly encouraged to audit the content of the generated scripts.

**Important: the scripts generated contain timestamped data. This has 2 consequences:**
* The clock of the machine you are using to generate the scripts must be on time. It is not uncommon for the clock of an offline machine to not be synced so please verify and adjust it before generating the scripts. It only needs to be accurate to the minute.
* The scripts are only valid for a limited time. You must execute the scripts within 1 hour of their creation to be certain that the entries contained in them will be accepted by the network.

### To generate a script to update the coinbase address

```bash
 node bin/factom-identity-cli update-coinbase-address --offline -s http://localhost:8088/v2 \
 --id 8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f \
 --sk1 sk12tdaziBoFyBHG56Ery3bPFFBDpy7Y3VymduGPfoj66cGhH4mHZrw \
 --fctaddress FA3HZDE4MdXAthauFoA3aKYpx33U4fT2kAABmfwk7NBqyLT2zed5 \
 --secaddress Es3ytEKt6t5Jm9juC4kR7EgKQSX8BpRnM4WADtgFoq7j1WgbeEGW
```

A script named `update-coinbase-address.<short_id>.sh` is generated and avaible in the folder after successful execution (*short_id* is the short id of your identity: the first 6 characters after the leading 888888).


### To generate a script to update the efficiency

```bash
 node bin/factom-identity-cli update-efficiency --offline -s http://localhost:8088/v2 \
 --id 8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f \
 --sk1 sk12tdaziBoFyBHG56Ery3bPFFBDpy7Y3VymduGPfoj66cGhH4mHZrw \
 --efficiency 50.1 \
 --secaddress Es3ytEKt6t5Jm9juC4kR7EgKQSX8BpRnM4WADtgFoq7j1WgbeEGW \
 --smchainid 8888887c01c12c72052f9c99b45782013feadb20c46ca86dc6e3a9730835848a
```

A script named `update-efficiency.<short_id>.sh` is generated and avaible in the folder after successful execution (*short_id* is the short id of your identity: the first 6 characters after the leading 888888).
Value of the *Server Management Subchain ID* can be found by looking at the identity root chain id in a Factom explorer: it is the value of the 3rd external id of the entry whose 2nd external id is equal to 'Register Server Management'. 

### To generate a script to add a coinbase cancel message

```bash
 node bin/factom-identity-cli add-coinbase-cancel --offline -s http://localhost:8088/v2 \
 --id 8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f \
 --sk1 sk12tdaziBoFyBHG56Ery3bPFFBDpy7Y3VymduGPfoj66cGhH4mHZrw \
 --height 39945 \
 --index 4 \
 --secaddress Es3ytEKt6t5Jm9juC4kR7EgKQSX8BpRnM4WADtgFoq7j1WgbeEGW \
 --smchainid 8888887c01c12c72052f9c99b45782013feadb20c46ca86dc6e3a9730835848a
```

A script named `add-coinbase-cancel.<short_id>.sh` is generated and avaible in the folder after successful execution (*short_id* is the short id of your identity: the first 6 characters after the leading 888888).
Value of the *Server Management Subchain ID* can be found by looking at the identity root chain id in a Factom explorer: it is the value of the 3rd external id of the entry whose 2nd external id is equal to 'Register Server Management'. 

## Run in Docker container

```
docker build -t factom-identity-cli github.com/PaulBernier/factom-identity-cli

docker run -it --rm factom-identity-cli ......
```
