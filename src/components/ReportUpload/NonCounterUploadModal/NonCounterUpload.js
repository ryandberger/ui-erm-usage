import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';
import _ from 'lodash';
import { CalloutContext } from '@folio/stripes/core';
import {
  Button,
  Col,
  Icon,
  KeyValue,
  Loading,
  Label,
  Row,
  TextField,
} from '@folio/stripes/components';

import FileUploader from '../FileUploader';

function FileUploadCard(props) {
  const [selectedFile, setSelectedFile] = useState();
  const [fileId, setFileId] = useState();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { intl, stripes } = props;
  const httpHeaders = Object.assign(
    {},
    {
      'X-Okapi-Tenant': stripes.okapi.tenant,
      'X-Okapi-Token': stripes.store.getState().okapi.token,
      'Content-Type': 'application/octet-stream',
    }
  );

  const callout = useContext(CalloutContext);

  const handleFail = (msg) => {
    props.stripes.logger.log('action', msg);
    callout.sendCallout({
      type: 'error',
      message: msg,
      timeout: 0,
    });
  };

  const doUploadRawFile = (file) => {
    setShowUploadModal(true);
    const okapiUrl = stripes.okapi.url;
    fetch(`${okapiUrl}/erm-usage/files`, {
      headers: httpHeaders,
      method: 'POST',
      body: file,
    })
      .then((response) => {
        setShowUploadModal(false);
        if (response.ok) {
          response.json().then((json) => {
            props.mutators.setFileId({}, json.id);
            props.mutators.setFileName({}, file.name);
            props.mutators.setFileSize({}, file.size);
            props.mutators.setProviderId({}, props.udpId);
            setFileId(json.id);
          });
        } else {
          handleFail(
            intl.formatMessage({
              id: 'ui-erm-usage.report.upload.failed',
            })
          );
        }
      })
      .catch((err) => {
        setShowUploadModal(false);
        const failText = intl.formatMessage({
          id: 'ui-erm-usage.report.upload.failed',
        });
        const infoText = `${failText} ${err.message}`;
        handleFail(infoText);
      });
  };

  const handleSelectFile = (acceptedFiles) => {
    const currentFile = acceptedFiles[0];
    setSelectedFile(currentFile);
    doUploadRawFile(currentFile);
  };

  const renderSelectedFile = () => {
    let downloadButton = '';
    if (_.isNil(selectedFile) || _.isNil(fileId)) {
      downloadButton = (
        <FormattedMessage id="ui-erm-usage.statistics.custom.selectFileFirst" />
      );
    } else {
      downloadButton = (
        <Button
          data-test-doc-file
          buttonStyle="link"
          onClick={() => props.handlers.doDownloadFile(fileId, selectedFile.name)}
        >
          <Icon icon="external-link">{selectedFile.name}</Icon>
        </Button>
      );
    }
    return (
      <KeyValue
        label={
          <Label required>
            <FormattedMessage id="ui-erm-usage.statistics.custom.selectedFile" />
          </Label>
        }
        value={downloadButton}
      />
    );
  };

  const renderUpload = () => {
    if (showUploadModal) {
      return (
        <>
          <FormattedMessage id="ui-erm-usage.statistics.counter.upload.wait" />
          <Loading />
        </>
      );
    } else {
      return null;
    }
  };

  return (
    <>
      <Row>
        <Col xs={6} md={6}>
          <Row>
            <Col xs={10}>
              <Field
                autoFocus
                component={TextField}
                data-test-custom-report-year
                id="custom-report-year"
                label={<FormattedMessage id="ui-erm-usage.general.year" />}
                name="year"
                placeholder="YYYY"
                required
              />
            </Col>
          </Row>
          <Row>
            <Col xs={10}>
              <Field
                component={TextField}
                data-test-custom-report-note
                id="custom-report-note"
                label={<FormattedMessage id="ui-erm-usage.general.note" />}
                name="note"
              />
            </Col>
          </Row>
        </Col>
        <Col xs={6} md={6}>
          <Row>
            <Col xs={10}>
              <FileUploader
                onSelectFile={handleSelectFile}
                selectedFile={selectedFile}
              />
            </Col>
          </Row>
          <Row>
            <></>
          </Row>
          <Row>
            <Col xs={10}>{renderSelectedFile()}</Col>
          </Row>
          <Row>
            {renderUpload()}
          </Row>
        </Col>
      </Row>
    </>
  );
}

FileUploadCard.propTypes = {
  intl: PropTypes.object,
  handlers: PropTypes.shape({
    doDownloadFile: PropTypes.func,
  }),
  mutators: PropTypes.shape({
    setFileId: PropTypes.func,
    setFileName: PropTypes.func,
    setFileSize: PropTypes.func,
    setProviderId: PropTypes.func,
  }),
  stripes: PropTypes.shape().isRequired,
  udpId: PropTypes.string,
};

export default injectIntl(FileUploadCard);
