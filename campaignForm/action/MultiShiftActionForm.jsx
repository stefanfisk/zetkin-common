import React from 'react';
import { connect } from 'react-redux';

import { FormattedMessage as Msg } from 'react-intl';

import PropTypes from '../../../utils/PropTypes';
import ActionFormTitle from './ActionFormTitle';
import ActionFormInfoLabel from './ActionFormInfoLabel';
import MultiActionFormItem from './MultiActionFormItem';
import ActionInfoSection from './ActionInfoSection';
import ResponseWidget from './ResponseWidget';

const mapStateToProps = state => ({
    orgList: state.getIn(['orgs', 'orgList', 'items'])
});

@connect(mapStateToProps)
export default class MultiShiftActionForm extends React.Component {
    static propTypes = {
        actions: PropTypes.array.isRequired,
        bookings: PropTypes.array.isRequired,
        responses: PropTypes.array.isRequired,
    };

    render() {
        let actions = this.props.actions;

        let orgItem = this.props.orgList.find(org =>
                org.get('id') == actions[0].get('org_id'));
        let organization = orgItem.get('title');

        let hasNeed = false;

        let shiftItems = actions.map(action => {
            let id = action.get('id');
            let startTime = Date.create(action.get('start_time'),
                { fromUTC: true, setUTC: true });
            let endTime = Date.create(action.get('end_time'),
                { fromUTC: true, setUTC: true });

            // TODO: Find nice way to localize this
            let timeLabel = startTime.format('{HH}:{mm}')
                + ' - ' + endTime.format('{HH}:{mm}');

            let isBooked = this.props.bookings
                .indexOf(action.get('id').toString()) >= 0;
            let response = this.props.responses
                .indexOf(action.get('id').toString()) >= 0;

            if (action.get('needs_participants')) {
                hasNeed = true;
            }

            return (
                <MultiActionFormItem key={ timeLabel }
                    className="MultiShiftActionForm-shiftItem"
                    label={ timeLabel } labelClass="time"
                    action={ action }
                    isBooked={ isBooked } response={ response }
                    onSignUp={ this.onSignUp.bind(this) }
                    onUndo={ this.onUndo.bind(this) }
                    onClick={ this.props.onSelect.bind(this, action) }
                    />
            );
        });

        let currentNeed;
        let currentNeedLabel = <Msg id="campaignForm.action.currentNeed" />

        if (this.props.showNeed && hasNeed) {
            currentNeed = <ActionFormInfoLabel className="showNeed"
                    label={ currentNeedLabel }/>;
        }

        return (
            <div className="MultiShiftActionForm">
                <ActionFormTitle
                    title={ actions[0].getIn(['activity', 'title']) }
                    organization={ organization }
                    />
                { currentNeed }
                <ActionFormInfoLabel className="campaign"
                    label={ actions[0].getIn(['campaign', 'title']) }/>
                <ActionFormInfoLabel className="location"
                        label={ actions[0].getIn(['location', 'title']) }/>
                <ul>
                    { shiftItems }
                </ul>
            </div>
        );
    }

    onSignUp(action, ev) {
        ev.stopPropagation();
        if (this.props.onChange) {
            this.props.onChange(action, true);
        }
    }

    onUndo(action, ev) {
        ev.stopPropagation();
        if (this.props.onChange) {
            this.props.onChange(action, false);
        }
    }
}
