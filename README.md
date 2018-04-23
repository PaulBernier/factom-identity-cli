# factom-identity-cli

## Installation

```bash
sudo npm install -g factom-identity-cli
```

## Usage

### Get identity information

```bash
$ factom-identity-cli get -s localhost:8088 888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584
```

### Update efficiency

```bash
$ factom-identity-cli update-efficiency -s localhost:8088 888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584 19.89 sk12J1qQCjTRtnJ15bmb1iSinEvtzgQMBi5szzV793LUJQib36pvz Es3ytEKt4R55M9juC4ks7EgxQSX8BpRnM4WADthFoq7j1WgbEEGW
```

### Update coinbase address

```bash
$ factom-identity-cli update-coinbase-address -s localhost:8088 888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584 FA24PAtyZWWVAPm95ZCVpwyY6RYHeCMTiZt2v4VQAY8aBXMUZyeF sk12J1qQCjTRtnJ15bmb1iSinEvtzgQMBi5szzV793LUJQib36pvz Es3ytEKt4R55M9juC4ks7EgxQSX8BpRnM4WADthFoq7j1WgbEEGW
```