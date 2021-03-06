import React, { useEffect, useState } from 'react';
import { Redirect, useRouteMatch } from 'react-router-dom';

import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import axios from 'axios';
import VoteQuestion from './VoteQuestion';
import VoteResult from './VoteResult';
import { ErrorDetail, APIError, CampaignStatus } from '../constant';

const useStyles = makeStyles({
  root: {
    padding: '10%',
    minWidth: '320px',
  },
  title: {
    color: 'white',
    fontWeight: 'bolder',
  },
  mainItem: {
    padding: '10px',
  },
  errorMessage: {
    textAlign: 'center',
    padding: '20px',
  },
  button: {
    border: '1px solid white',
    color: 'white',
  },
});

const VoteDetail = () => {
  const classes = useStyles();
  const [voteCampaign, setVoteCampaign] = useState({});
  const [myVote, setMyVote] = useState('');
  const [checkResult, setCheckResult] = useState(false);
  const [returnHome, setReturnHome] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { params: { campaign_id: campaignId } } = useRouteMatch('/:campaign_id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/campaign/${campaignId}/`,
        );
        setErrorMessage('');
        setVoteCampaign(response.data);
      } catch (error) {
        setErrorMessage(error.response.data.detail);
        setVoteCampaign({});
      }
    };
    fetchData();
  }, [campaignId, checkResult]);

  // clear vote record when switch to another campaign
  useEffect(() => {
    setMyVote('');
  }, [campaignId]);

  let detailComponent;
  switch (Object.keys(voteCampaign).length > 0) {
    case true: {
      if (voteCampaign.status !== CampaignStatus.active || checkResult) {
        detailComponent = (
          <VoteResult
            voteCampaignDetail={voteCampaign}
            back={() => setReturnHome(true)}
            myVote={myVote}
          />
        );
        break;
      }
      detailComponent = (
        <VoteQuestion
          voteCampaignDetail={voteCampaign}
          checkResult={() => setCheckResult(true)}
          setMyVote={(optionCode) => setMyVote(optionCode)}
          back={() => setReturnHome(true)}
        />
      );
      break;
    }
    default: {
      detailComponent = null;
    }
  }

  return (
    <div className={classes.root}>
      {returnHome && <Redirect to="/" />}
      <Typography className={classes.title} variant="h5" align="center" gutterBottom>
        {`Camapign ${campaignId}`}
      </Typography>
      {errorMessage && (
        <Typography className={classes.errorMessage} color="secondary" variant="body1" align="center" gutterBottom>
          {errorMessage === APIError.notFound ? (
            ErrorDetail.campaignNotExist
          ) : (
            ErrorDetail.unknwonError
          )}
        </Typography>
      )}
      {Object.keys(voteCampaign).length > 0 && (
        <>
          <Typography className={classes.title} variant="h5" align="center" gutterBottom>
            {voteCampaign.question}
          </Typography>
          <Typography className={classes.title} variant="body1" align="center">
            {`Start time: ${new Date(`${voteCampaign.start_time}Z`).toLocaleDateString('en-US')} ${new Date(`${voteCampaign.start_time}Z`).toLocaleTimeString('en-US')}`}
          </Typography>
          <Typography className={classes.title} variant="body1" align="center">
            {`End time: ${new Date(`${voteCampaign.end_time}Z`).toLocaleDateString('en-US')} ${new Date(`${voteCampaign.end_time}Z`).toLocaleTimeString('en-US')}`}
          </Typography>
          <div className={classes.mainItem}>{detailComponent}</div>
        </>
      )}
      <Grid container direction="row" alignItems="center" justify="center">
        <Grid item>
          <Button className={classes.button} variant="outlined" onClick={() => setReturnHome(true)}>
            Back
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default VoteDetail;
