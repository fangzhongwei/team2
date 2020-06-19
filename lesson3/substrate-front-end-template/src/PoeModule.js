import React, {useEffect, useState} from 'react';
import {Button, Container, Dropdown, Form, Grid, Image, Input, Menu} from 'semantic-ui-react';

import {useSubstrate} from './substrate-lib';
import {TxButton} from './substrate-lib/components';
import {blake2AsHex} from '@polkadot/util-crypto';

function Main(props) {
    const {api} = useSubstrate();
    const {accountPair} = props;

    // The transaction submission status
    const [status, setStatus] = useState('');

    const [digest, setDigest] = useState("");
    const [owner, setOwner] = useState("");
    const [blockNumber, setBlockNumber] = useState(0);


    const [accountSelected, setAccountSelected] = useState('');
    const { keyring } = useSubstrate();
    const keyringOptions = keyring.getPairs().map(account => ({
        key: account.address,
        value: account.address,
        text: account.meta.name.toUpperCase(),
        icon: 'user'
    }));

    useEffect(() => {
        let unsubscribe;
        api.query.poeModule.proofs(digest, (result) => {
            setOwner(result[0].toString());
            setBlockNumber(result[1].toNumber());
        }).then(unsub => {
            unsubscribe = unsub;
        })
            .catch(console.error);

        return () => unsubscribe && unsubscribe();
    }, [digest, api.query.poeModule]);

    const handleFileChosen = (file) => {

        let fileReader = new FileReader();
        const bufferToDigest = () => {

            const content = Array.from(new Uint8Array(fileReader.result))
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('');

            const hash = blake2AsHex(content, 256);

            setDigest(hash);
        };

        fileReader.onload = bufferToDigest;
        fileReader.readAsArrayBuffer(file);
    };

    const onChange = address => {
        setAccountSelected(address);
    };

    return (
        <Grid.Column width={8}>
            <h1>Proof of Existence</h1>
            <Form>
                <Form.Field>
                    <Input
                        type='file'
                        id='file'
                        lable='Your File'
                        onChange={(e) => handleFileChosen(e.target.files[0])}
                    />
                </Form.Field>

                <Form.Field>
                    <Menu
                        attached='top'
                        tabular
                        style={{
                            backgroundColor: '#fff',
                            borderColor: '#fff',
                            paddingTop: '1em',
                            paddingBottom: '1em'
                        }}
                    >
                        <Container>
                            <Menu.Menu position='left' style={{alignItems: 'center'}}>
                                To Account:
                                <Dropdown
                                    search
                                    selection
                                    clearable
                                    placeholder='Select an account'
                                    options={keyringOptions}
                                    onChange={(_, dropdown) => {
                                        onChange(dropdown.value);
                                    }}
                                    value={accountSelected}
                                />
                            </Menu.Menu>
                        </Container>
                    </Menu>
                </Form.Field>

                <Form.Field>
                    <TxButton
                        accountPair={accountPair}
                        label='Create Claim'
                        setStatus={setStatus}
                        type='SIGNED-TX'
                        attrs={{
                            palletRpc: 'poeModule',
                            callable: 'createClaim',
                            inputParams: [digest],
                            paramFields: [true]
                        }}
                    />

                    <TxButton
                        accountPair={accountPair}
                        label='Revoke Claim'
                        setStatus={setStatus}
                        type='SIGNED-TX'
                        attrs={{
                            palletRpc: 'poeModule',
                            callable: 'revokeClaim',
                            inputParams: [digest],
                            paramFields: [true]
                        }}
                    />

                    <TxButton
                        accountPair={accountPair}
                        label='Transfer Claim'
                        setStatus={setStatus}
                        type='SIGNED-TX'
                        attrs={{
                            palletRpc: 'poeModule',
                            callable: 'transferClaim',
                            inputParams: [digest, accountSelected],
                            paramFields: [true]
                        }}
                    />
                </Form.Field>

                <div>{status}</div>
                <div>{`Claim info, owner: ${owner}, blockNumber: ${blockNumber}`}</div>
            </Form>
        </Grid.Column>
    );
}

export default function PoeModule(props) {
    const {api} = useSubstrate();
    return (api.query.poeModule && api.query.poeModule.proofs
        ? <Main {...props} /> : null);
}
