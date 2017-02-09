import React, { Component, PropTypes } from "react";
import R from "ramda"; //eslint-disable-line id-length
import { getConfiguredSources, TWITTER, WEB, searchInConfiguredSources } from "../../sourceConfig/actions/SourceConfigurationActions";
import { connect } from "react-redux";
import Input from "./../../utils/components/Input";

export class Sources {
    constructor(component) {
        this.component = component;
    }

    init() {
        this.component.props.dispatch(getConfiguredSources());
        this.component.props.dispatch(searchInConfiguredSources(""));
    }
    searchInSources(event) {
        let value = event.target.value;
        this.component.props.dispatch(searchInConfiguredSources(value));
    }
    displayConfiguredSources() {
        if(this.component.props.currentTab === TWITTER) {
            return (
                <div className="configured-sources-block">
                    <h1>{ "My Sources" }</h1>
                    { this._configuredSourcesGroup("Twitter", "twitter", this.component.props.searchKeyword) }
                </div>
            );
        }

        if(this.component.props.currentTab === WEB) {
            return (
                <div className="configured-sources-block">
                    <h1>{ "My Sources" }</h1>
                    { this._configuredSourcesGroup("Web", "web", this.component.props.searchKeyword) }
                </div>
            );
        }

        return (
            <div className="configured-sources-block">
                <h1>{ "My Sources" }</h1>
                { this._configuredSourcesGroup("Facebook Profiles", "profiles", this.component.props.searchKeyword) }
                { this._configuredSourcesGroup("Facebook Pages", "pages", this.component.props.searchKeyword) }
                { this._configuredSourcesGroup("Facebook Groups", "groups", this.component.props.searchKeyword) }
            </div>
        );
    }
    searchBar() {
        //eslint-disable-next-line brace-style
        return <Input eventHandlers={{ "onKeyUp": (event) => { this.searchInSources(event); } }} placeholder="search" addonSrc="./images/search-icon.png"/>;
    }
    _configuredSourcesGroup(heading, sourceType, searchKey) {
        return (
            <div className="configured-sources__group open">
                <h3 className="configured-sources__group__heading">{heading}</h3>
                <ul className="configured-sources">
                    { this.component._renderSources(sourceType, searchKey) }
                </ul>
            </div>
        );

    }
}

class ConfiguredSources extends Component {

    constructor() {
        super();
        this.sourcesObject = new Sources(this);
    }

    componentDidMount() {
        this.sourcesObject.init();
    }

    _renderSources(sourceType, searchKey) {
        let configuredSourceDOM = (source) => <li className="source-name" key={source._id}>{source.name}</li>;
        if(searchKey) {
            let key = searchKey.toUpperCase();
            let configuredSources = source => source.name.toUpperCase().match(key) && source;
            return R.pipe(
                R.filter(configuredSources),
                R.map(configuredSourceDOM)
            )(this.props.sources[sourceType]);
        }

        return R.map(configuredSourceDOM, R.prop(sourceType, this.props.sources));
    }

    render() {
        return (
            <aside className="configured-sources-container">
                { this.sourcesObject.displayConfiguredSources() }
                { this.sourcesObject.searchBar() }
            </aside>
        );
    }
}

function mapToStore(state) {
    return {
        "sources": state.configuredSources,
        "searchKeyword": state.searchInConfiguredSources,
        "currentTab": state.currentSourceTab
    };
}

ConfiguredSources.propTypes = {
    "sources": PropTypes.object.isRequired,
    "dispatch": PropTypes.func.isRequired,
    "searchKeyword": PropTypes.string,
    "currentTab": PropTypes.string.isRequired
};

export default connect(mapToStore)(ConfiguredSources);
