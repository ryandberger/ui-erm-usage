import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';
import setupApplication from '../helpers/setup-application';
import UDPDetailsPage from '../interactors/udp-details-page';
import UDPInteractor from '../interactors/udp';

describe('UDPDetailsPage', () => {
  setupApplication();
  const udpDetailsPage = new UDPDetailsPage();
  const udpInteractor = new UDPInteractor();

  let udp = null;
  beforeEach(async function () {
    udp = this.server.create('usage-data-provider', 'withUsageReports');
    await this.visit('/eusage/?filters=harvestingStatus.active');
  });

  it('shows the list of udp items - details udp', () => {
    expect(udpInteractor.isVisible).to.equal(true);
  });

  it('renders each instance', () => {
    expect(udpInteractor.instances().length).to.be.gte(1);
  });

  describe('clicking on the first item', function () {
    beforeEach(async function () {
      await udpInteractor.instances(0).click();
    });

    it('displays udp label in the pane header', function () {
      expect(udpDetailsPage.title).to.include(udp.label);
    });

    it('all accordions are present', function () {
      expect(udpDetailsPage.harvestingAccordion.isPresent).to.equal(true);
      expect(udpDetailsPage.sushiCredentialsAccordion.isPresent).to.equal(true);
      expect(udpDetailsPage.statisticsAccordion.isPresent).to.equal(true);
      expect(udpDetailsPage.uploadAccordion.isPresent).to.equal(true);
    });

    describe('all accordions can be expanded', function () {
      beforeEach(async function () {
        await udpDetailsPage.expandAll.click();
      });

      it('harvesting configuration is expanded and harvesting status is displayed', () => {
        expect(udpDetailsPage.harvestingAccordionButton.expanded).to.be.equal(
          'true'
        );
      });

      describe('all accordions can be collapsed', function () {
        beforeEach(async function () {
          await udpDetailsPage.expandAll.click();
        });

        it('harvesting configuration is collapsed and harvesting status is not displayed', () => {
          expect(udpDetailsPage.harvestingAccordionButton.expanded).to.be.equal(
            'false'
          );
        });
      });
    });

    describe('service type is set correctly', function () {
      beforeEach(async function () {
        await udpDetailsPage.harvestingAccordion.click();
      });

      it('service type is set', () => {
        expect(udpDetailsPage.harvesterImpls).to.be.equal('Counter-Sushi 4.1');
      });

      it('last harvesting is set and parsed', () => {
        expect(udpDetailsPage.lastHarvesting).to.have.string('Jan 22 2020');
      });
    });

    describe('can select report type for download multi months', function () {
      beforeEach(async function () {
        await udpDetailsPage.statisticsAccordion.click();
      });

      it('report type select is available', () => {
        expect(udpDetailsPage.reportTypeDownloadSelect.value).to.be.equal(
          'BR1'
        );
      });

      it('data type select is available', () => {
        expect(udpDetailsPage.dataTypeDownloadSelect.value).to.be.equal('csv');
      });

      describe('enter valid startDate & endDate, but startDate > endDate', () => {
        beforeEach(async () => {
          await udpDetailsPage.startDateDownloadInput.fill('2019-04');
          await udpDetailsPage.endDateDownloadInput.fill('2019-02');
        });
        it('should display validation error: end must be greater start', () => {
          expect(udpDetailsPage.dateInputError.feedbackError).to.equal(
            'End must be greater than start'
          );
        });
      });

      describe('enter invalid startDate', () => {
        beforeEach(async () => {
          await udpDetailsPage.startDateDownloadInput.fill('2019-111');
        });
        it('should display validation error', () => {
          expect(udpDetailsPage.dateInputError.feedbackError).to.equal(
            'Must be YYYY-MM'
          );
        });
      });

      describe('enter invalid endDate', () => {
        beforeEach(async () => {
          await udpDetailsPage.endDateDownloadInput.fill('2019-111');
        });
        it('should display validation error', () => {
          expect(udpDetailsPage.dateInputError.feedbackError).to.equal(
            'Must be YYYY-MM'
          );
        });
      });

      describe('enter valid startDate & endDate', () => {
        beforeEach(async () => {
          await udpDetailsPage.startDateDownloadInput.fill('2019-01');
          await udpDetailsPage.endDateDownloadInput.fill('2019-04');
        });
        it('should not display validation error', () => {
          expect(udpDetailsPage.dateInputError.exist).to.equal(false);
        });
      });

      describe('JR1 can be selected', () => {
        beforeEach(async () => {
          await udpDetailsPage.reportTypeDownloadSelect.select('JR1');
        });
        it('reportType is changed to "JR1"', () => {
          expect(udpDetailsPage.reportTypeDownloadSelect.value).to.be.equal(
            'JR1'
          );
        });
      });

      describe('XLSX can be selected', () => {
        beforeEach(async () => {
          await udpDetailsPage.dataTypeDownloadSelect.select('XLSX');
        });
        it('dataType is changed to "xlsx"', () => {
          expect(udpDetailsPage.dataTypeDownloadSelect.value).to.be.equal(
            'xlsx'
          );
        });
      });
    });

    describe('can open report info menu', () => {
      beforeEach(async function () {
        await udpDetailsPage.statisticsAccordion.click();
      });

      describe('valid report has correct buttons', () => {
        beforeEach(async function () {
          await udpDetailsPage.validReport();
        });

        it('valid report has download json xml and delete button', () => {
          expect(
            udpDetailsPage.reportInfoValid.downloadJsonXmlButton.isPresent
          ).to.equal(true);
          expect(
            udpDetailsPage.reportInfoValid.deleteButton.isPresent
          ).to.equal(true);
        });
      });

      describe('failed report has correct buttons', () => {
        beforeEach(async function () {
          await udpDetailsPage.failedReport();
        });

        it('failed report has delete button but not download json xml button', () => {
          expect(
            udpDetailsPage.reportInfoFailed.downloadJsonXmlButton.isPresent
          ).to.equal(false);
          expect(
            udpDetailsPage.reportInfoFailed.deleteButton.isPresent
          ).to.equal(true);
        });
      });

      describe('can open tags helper app', () => {
        beforeEach(async function () {
          await udpDetailsPage.clickShowTags();
          await udpDetailsPage.tagsSelect.clickable();
        });

        it('tags helper app shown', () => {
          expect(udpDetailsPage.tagsSelect.tagSelection.isPresent).to.be.true;
        });
      });
    });
  });

  describe('custom reports are listed', function () {
    beforeEach(async function () {
      await udpDetailsPage.statisticsAccordion.click();
      await udpDetailsPage.clickCustomReportAccordion();
      await udpDetailsPage.clickExpandAllCustomReportYears();
    });

    it('renders custom reports', () => {
      expect(udpDetailsPage.customReports.instances().length).to.be.gte(1);
    });
  });

  describe('custom reports can be selected', function () {
    beforeEach(async function () {
      await udpDetailsPage.statisticsAccordion.click();
      await udpDetailsPage.clickCustomReportAccordion();
      await udpDetailsPage.clickExpandAllCustomReportYears();
      await udpDetailsPage.customReports.clickFirstRow();
    });

    it('renders custom report details', () => {
      expect(
        udpDetailsPage.customReportInfo.downloadCustomReportButton.isPresent
      ).to.equal(true);
      expect(
        udpDetailsPage.customReportInfo.deleteCustomReportButton.isPresent
      ).to.equal(true);
    });
  });

  describe('can open upload counter report', function () {
    beforeEach(async function () {
      await udpDetailsPage.uploadAccordion.click();
      await udpDetailsPage.clickUploadCounterButton();
    });

    it('renders upload counter report modal', () => {
      expect(udpDetailsPage.uploadCounterModal.isPresent).to.equal(true);
    });

    it('does not render upload non-counter report modal', () => {
      expect(udpDetailsPage.uploadNonCounterModal.isPresent).to.equal(false);
    });

    it('does render upload file button', () => {
      expect(
        udpDetailsPage.uploadCounterModal.uploadFileButton.isPresent
      ).to.equal(true);
    });
  });

  describe('can open upload non-counter report', function () {
    beforeEach(async function () {
      await udpDetailsPage.uploadAccordion.click();
      await udpDetailsPage.clickUploadNonCounterButton();
    });

    it('does not render upload counter report modal', () => {
      expect(udpDetailsPage.uploadCounterModal.isPresent).to.equal(false);
    });

    it('renders upload non-counter report modal', () => {
      expect(udpDetailsPage.uploadNonCounterModal.isPresent).to.equal(true);
    });

    it('does render upload file button', () => {
      expect(
        udpDetailsPage.uploadNonCounterModal.uploadFileButton.isPresent
      ).to.equal(true);
    });

    it('does render year input', () => {
      expect(udpDetailsPage.uploadNonCounterModal.yearInput.isPresent).to.equal(
        true
      );
    });
  });
});

describe('UDPDetailsPage by ID', () => {
  setupApplication();
  const udpDetailsPage = new UDPDetailsPage();

  let udp = null;
  beforeEach(async function () {
    udp = this.server.create('usage-data-provider', 'withUsageReports');
    this.visit(`/eusage/view/${udp.id}`);
  });

  it('displays udp label in the pane header', function () {
    expect(udpDetailsPage.title).to.include(udp.label);
  }).timeout(6000);
});

describe('Inactive UDP disabled start harvester', () => {
  setupApplication();
  const udpDetailsPage = new UDPDetailsPage();

  let udp = null;
  beforeEach(async function () {
    udp = this.server.create('usage-data-provider', 'withSetInactive');
    this.visit(`/eusage/view/${udp.id}`);
  });

  it('harvesting config accordion is present', function () {
    expect(udpDetailsPage.harvestingAccordion.isPresent).to.equal(true);
  });

  describe('open harvesting accordion and check if start harvesting button is disabled', function () {
    beforeEach(async function () {
      await udpDetailsPage.harvestingAccordionButton.click();
    });

    it('start harvesting button is present and disabled', () => {
      expect(udpDetailsPage.startHarvesterButton.isPresent).to.equal(true);
      expect(udpDetailsPage.startHarvesterButton.isDisabled).to.equal(true);
    });
  });
});

describe('Active UDP enabled start harvester', () => {
  setupApplication();
  const udpDetailsPage = new UDPDetailsPage();

  let udp = null;
  beforeEach(async function () {
    udp = this.server.create('usage-data-provider');
    this.visit(`/eusage/view/${udp.id}`);
  });

  it('harvesting config accordion is present', function () {
    expect(udpDetailsPage.harvestingAccordion.isPresent).to.equal(true);
  });

  describe('open harvesting accordion and check if start harvesting button is enabled', function () {
    beforeEach(async function () {
      await udpDetailsPage.harvestingAccordionButton.click();
    });

    it('start harvesting button is present and enabled', () => {
      expect(udpDetailsPage.startHarvesterButton.isPresent).to.equal(true);
    });
  });
});
