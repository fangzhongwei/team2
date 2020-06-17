import React, { useEffect, useState } from 'react';
import { Table, Grid, Button } from 'semantic-ui-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSubstrate } from './substrate-lib';


function Main(props) {
    const { api, keyring } = useSubstrate();
    const accounts = keyring.getPairs();
    const [balances, setBalances] = useState({});

    useEffect(() => {
        const addresses = keyring.getPairs().map(account => account.address);
        let unsubscribeAll = null;

        alert(api.query.poeModule.accountProofs.length);

        api.query.poeModule.accountProofs
            .multi(addresses, proofs => {
                const balancesMap = addresses.reduce((acc, address, index) => ({
                    ...acc, [address]: JSON.stringify(proofs[index])
                }), {});
                setBalances(balancesMap);
            }).then(unsub => {
            unsubscribeAll = unsub;
        }).catch(console.error);

        return () => unsubscribeAll && unsubscribeAll();
    }, [api, keyring, setBalances]);

    return (
        <Grid.Column>
            <h1>Poe List</h1>
            <Table celled striped size='small'>
                <Table.Body>{accounts.map(account =>
                        <Table.Row key={account.address}>
                            <Table.Cell width={3} textAlign='right'>{account.meta.name}</Table.Cell>
                            <Table.Cell width={10}>
              <span style={{ display: 'inline-block', minWidth: '31em' }}>
                {account.address}
              </span>

                            </Table.Cell>
                            <Table.Cell width={3}>{
                                balances && balances[account.address] &&
                                balances[account.address]
                            }</Table.Cell>
                        </Table.Row>
                )}
                </Table.Body>
            </Table>
        </Grid.Column>
    );
}
export default function MyPoes(props) {
    const {api} = useSubstrate();
    return (api.query.poeModule && api.query.poeModule.accountProofs
        ? <Main {...props} /> : null);
}
