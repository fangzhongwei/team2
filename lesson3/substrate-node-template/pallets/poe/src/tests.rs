use crate::{Error, mock::*};
use super::*;
use frame_support::{assert_ok, assert_noop};

#[test]
fn create_claim_works() {
    new_test_ext().execute_with(|| {
        let claim = vec![0, 1];
        assert_ok!(PoeModule::create_claim(Origin::signed(1), claim.clone()));
        assert_eq!(Proofs::<Test>::get(&claim), (1, system::Module::<Test>::block_number()));
    })
}

#[test]
fn revoke_claim_works() {
    new_test_ext().execute_with(|| {
        let claim = vec![0, 1];
        let _ = PoeModule::create_claim(Origin::signed(1), claim.clone());

        assert_ok!(PoeModule::revoke_claim(Origin::signed(1), claim.clone()));
    })
}

#[test]
fn transfer_claim_works() {
    new_test_ext().execute_with(|| {
        let claim = vec![0, 1];
        let _ = PoeModule::create_claim(Origin::signed(1), claim.clone());

        assert_ok!(PoeModule::transfer_claim(Origin::signed(1), claim.clone(), 2));
    })
}
