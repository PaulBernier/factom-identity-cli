# Updating efficiency and coinbase address with offline generation

## Requirements

You will need 2 usb sticks ready:

-   One that will be used to boot a temporary linux to perform the operations. This usb stick will be now referenced as BOOT stick.
-   One that will be used to store data related to the operations. This usb stick will be now referenced as DATA stick. Copy that file to this stick to be able to follow the instructions at all time.

You will also need your Factom identity information handy:

-   Your identity root chain id (starts with 888888)
-   Your server management subchain id (starts with 888888)
-   Your secret level 1 identity key (starts with SK1)

The value of the Server Management Subchain ID can be found by looking at the identity root chain id in a Factom explorer: it is the value of the 3rd external id of the entry whose 2nd external id is equal to 'Register Server Management'.

## Steps

### 1. Get Entry Credits and a Factoid address

You will need a valid mainnet entry credit address funded with few ECs (maybe a hundred to be safe). Write down the corresponding private EC address (that starts by 'Es') or you can store it on the DATA stick. You also need a mainnet public Factoid address (that starts by 'FA') that will be used as the receiving coinbase address.

### 2. Create a create Ubuntu 18.04 bootable USB stick

Use your BOOT stick here. This step depends on your OS. You can search on Google for "create ubuntu bootable usb stick".

### 3. Boot Ubuntu 18.04 from the BOOT stick

### 4. Connect to the internet

### 5. Open a terminal and type the following commands

This will install Node.js 10 and the factom-identity-cli.

```bash
sudo apt-get update
sudo apt install -y git curl
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
git clone https://github.com/PaulBernier/factom-identity-cli.git
cd factom-identity-cli
npm install
```

### 6. Turn off the internet connection

From now on your ubuntu should _never_ get connected to the Internet. You can double check by typing `ping 8.8.8.8`. Or you can unplung your wifi if you really want to be sure...

### 7. Generate update scripts

**Note:
It is highly recommended that you run the following commands with a leading space to prevent writing secrets (SK1 key, entry credit private key) to the command line history.**

In a terminal, with your own values:

```bash
 node bin/factom-identity-cli update-coinbase-address --offline -s https://api.factomd.net/v2 \
 --id 888888aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa \
 --fctaddress FAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \
 --sk1 sk1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \
 --secaddress EsXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

```bash
  node bin/factom-identity-cli update-efficiency --offline -s https://api.factomd.net/v2 \
  --id 888888aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa \
  --efficiency 50.1 \
  --sk1 sk1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \
  --secaddress EsXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \
  --smchainid 888888bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
```

Those 2 commands will create 2 scripts if successful: `update-coinbase-address.<short_id>.sh` and `update-efficiency.<short_id>.sh` where _short_id_ is the short id of your identity (the first 6 characters after the leading 888888). You are invited to audit the content of those scripts. Copy those 2 scripts to your DATA stick.

**Important: the scripts generated contain timestamped data. This has 2 consequences:**

-   The clock of the machine you are using to generate the scripts must be on time. It is not uncommon for the clock of an offline machine to not be synced so please verify and adjust it before generating the scripts. It only needs to be accurate to the minute.
-   The scripts are only valid for a limited time. You must execute the scripts within 1 hour of their creation to be certain that the entries contained in them will be accepted by the network.

### 8. Shutdown the Ubuntu session

### 9. Execute the scripts to update efficiency and coinbase address

-   Log into a computer with internet connection.
-   Plugin the DATA stick.
-   Execute both bash scripts. They simply use `curl` command line that should be available on most unix based systems. The scripts will make the requests through the Factom Open Node network. You can edit the scripts to choose another endpoint (localhost for instance).
-   Inspect the output of the scripts for success messages.
-   You can check in an explorer that your identity root chain and server management subchain have been updated after 10 minutes (next block).

### 10. Format the BOOT stick

Or even better, do a secure erase with specialized tools.
