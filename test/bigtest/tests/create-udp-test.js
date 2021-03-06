import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import UDPInteractor from '../interactors/udp';
import UDPEditPage from '../interactors/udp-edit-page';

import setupApplication from '../helpers/setup-application';

import wait from '../helpers/wait';

describe('Create UDP', () => {
  setupApplication();
  const udpInteractor = new UDPInteractor();
  const udpEditPage = new UDPEditPage();

  beforeEach(function () {
    return this.visit('/eusage/create?filters=harvestingStatus.active&sort=label', () => {
      expect(udpInteractor.$root).to.exist;
    });
  });

  it('harvestingStatus select is available', () => {
    expect(udpEditPage.harvestingStatusSelect.value).to.be.equal('');
  });

  describe('harvestingStatus can be selected', () => {
    beforeEach(async () => {
      await udpEditPage.harvestingStatusSelect.select('Active');
    });

    it('harvestingStatus is changed to "active"', () => {
      expect(udpEditPage.harvestingStatusSelect.value).to.be.equal('active');
    });
  });

  describe('harvestingStatus can be changed to inactive', () => {
    beforeEach(async () => {
      await udpEditPage.harvestingStatusSelect.select('Active');
      await udpEditPage.harvestingStatusSelect.select('Inactive');
    });

    it('harvestingStatus is changed back to blank', () => {
      expect(udpEditPage.harvestingStatusSelect.value).to.be.equal('inactive');
    });
  });

  describe('report release can be selected', () => {
    beforeEach(async () => {
      await udpEditPage.reportReleaseSelect.select('Counter 4');
      await udpEditPage.clickAddReportButton();
    });

    it('selected report release is changed to "4"', () => {
      expect(udpEditPage.reportReleaseSelect.value).to.be.equal('4');
    });

    describe('change report release to counter 5', () => {
      beforeEach(async () => {
        await udpEditPage.reportReleaseSelect.select('Counter 5');
        await wait(300);
        await udpEditPage.confirmationModal.clickConfirmClearReportsButton();
      });
      it('selected report release is changed to "5"', () => {
        expect(udpEditPage.reportReleaseSelect.value).to.be.equal('5');
      });
    });

    describe('do not change report release to counter 5', () => {
      beforeEach(async () => {
        await udpEditPage.reportReleaseSelect.select('Counter 5');
        await wait(300);
        await udpEditPage.confirmationModal.clickCancelClearReportsButton();
      });
      it('selected report release did not change to "5"', () => {
        expect(udpEditPage.reportReleaseSelect.value).to.be.equal('4');
      });
    });
  });
});
