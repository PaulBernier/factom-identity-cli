const assert = require('chai').assert;
const fs = require('fs');
const { generateUpdateEfficiencyScript,
    generateUpdateCoinbaseAddressScript,
    generateAddCoinbaseCancelScript } = require('../src/generate-script');

const FACTOMD_CONF = { host: 'test.factom.org', port: 8088 };

describe('Generate scripts', function () {

    before(function () {
        ['update-coinbase-address.sh', 'update-efficiency.sh', 'add-coinbase-address.sh'].forEach(function (f) {
            try {
                fs.unlinkSync(f);
            } catch (e) { }
        });
    });

    it('should generate update coinbase address script', function () {

        generateUpdateCoinbaseAddressScript(
            '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762',
            'FA1y5ZGuHSLmf2TqNf6hVMkPiNGyQpQDTFJvDLRkKQaoPo4bmbgu',
            'sk13iLKJfxNQg8vpSmjacEgEQAnXkn7rbjd5ewexc1Un5wVPa7KTk',
            'Es32PjobTxPTd73dohEFRegMFRLv3X5WZ4FXEwNN8kE2pMDfeMym',
            FACTOMD_CONF);

        const script = fs.readFileSync('update-coinbase-address.sh').toString();
        assert.include(script, 'coinbase address');
        assert.include(script, 'test.factom.org');
        assert.include(script, '8088');
        assert.notInclude(script, 'undefined');

        fs.unlinkSync('update-coinbase-address.sh');
    });


    it('should generate update efficiency script', function () {

        generateUpdateEfficiencyScript(
            '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762',
            '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584',
            49.57,
            'sk13iLKJfxNQg8vpSmjacEgEQAnXkn7rbjd5ewexc1Un5wVPa7KTk',
            'Es32PjobTxPTd73dohEFRegMFRLv3X5WZ4FXEwNN8kE2pMDfeMym',
            FACTOMD_CONF);

        const script = fs.readFileSync('update-efficiency.sh').toString();
        assert.include(script, 'efficiency');
        assert.include(script, 'test.factom.org');
        assert.include(script, '8088');
        assert.notInclude(script, 'undefined');

        fs.unlinkSync('update-efficiency.sh');
    });

    it('should generate add coinbase cancel script', function () {

        generateAddCoinbaseCancelScript(
            '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762',
            '888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584',
            4957,
            2,
            'sk13iLKJfxNQg8vpSmjacEgEQAnXkn7rbjd5ewexc1Un5wVPa7KTk',
            'Es32PjobTxPTd73dohEFRegMFRLv3X5WZ4FXEwNN8kE2pMDfeMym',
            FACTOMD_CONF);

        const script = fs.readFileSync('add-coinbase-cancel.sh').toString();
        assert.include(script, 'coinbase cancel');
        assert.include(script, 'test.factom.org');
        assert.include(script, '8088');
        assert.notInclude(script, 'undefined');

        fs.unlinkSync('add-coinbase-cancel.sh');
    });
});