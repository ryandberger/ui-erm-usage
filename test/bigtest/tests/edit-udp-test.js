import {
  beforeEach,
  describe,
  it
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UDPEditPage from '../interactors/udp-edit-page';
import UDPInteractor from '../interactors/udp';

describe('Edit UDP', () => {
  setupApplication();
  const udpInteractor = new UDPInteractor();
  const udpEditPage = new UDPEditPage();

  let udp = null;

  beforeEach(async function () {
    udp = this.server.create('usage-data-provider');
    return this.visit('/eusage?filters=harvestingStatus.Active', () => {
      expect(udpInteractor.$root).to.exist;
    });
  });

  describe('UDP edit form is displayed ', () => {
    beforeEach(async function () {
      await udpInteractor.clickActiveUDPsCheckbox();
      return this.visit(`/eusage/view/${udp.id}?filters=harvestingStatus.Inactive,harvestingStatus.Active&layer=edit`);
    });

    it('displays Edit UDP form', () => {
      expect(udpEditPage.$root).to.exist;
    });
  });
});