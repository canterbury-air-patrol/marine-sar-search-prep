
import React from 'react'
import PropTypes from 'prop-types'

import { marine_sweep_widths as marineSweepWidths, marine_sweep_width_weather_corrections as weatherCorrections } from '@canterbury-air-patrol/marine-sweep-width-data'

import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';


class TargetTypeSelector extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(event) {
        const target = event.target
        const value = target.value

        this.props.targetTypeChange(value)
    }

    render() {
        const selectObjects = []
        for (const idx in this.props.possible_targets) {
            const target = this.props.possible_targets[idx]
            selectObjects.push(<option key={target} value={target}>{target}</option>)
        }
        return (
            <Form.Select defaultValue={this.props.selected} onChange={this.handleChange}>
                {selectObjects}
            </Form.Select>
        )
    }
}
TargetTypeSelector.propTypes = {
    possible_targets: PropTypes.array.isRequired,
    targetTypeChange: PropTypes.func.isRequired,
    selected: PropTypes.string.isRequired
}

class AssetTypeSelector extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(event) {
        const target = event.target
        const value = target.value

        this.props.assetTypeChange(value)
    }

    render() {
        const selectObjects = []
        for (const idx in this.props.possibleAssets) {
            const assetType = this.props.possibleAssets[idx]
            selectObjects.push(<option key={assetType} value={assetType}>{assetType}</option>)
        }
        return (
            <Form.Select defaultValue={this.props.selected} onChange={this.handleChange}>
                {selectObjects}
            </Form.Select>
        )
    }
}
AssetTypeSelector.propTypes = {
    possibleAssets: PropTypes.array.isRequired,
    assetTypeChange: PropTypes.func.isRequired,
    selected: PropTypes.string.isRequired
}

class AssetHeightSelector extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(event) {
        const target = event.target
        const value = target.value

        this.props.heightChange(value)
    }

    render() {
        const selectObjects = []
        for (const idx in this.props.possibleHeights) {
            const height = this.props.possibleHeights[idx]
            selectObjects.push(<option key={height} value={height}>{height}</option>)
        }
        return (
            <Form.Select defaultValue={this.props.selected} onChange={this.handleChange}>
                {selectObjects}
            </Form.Select>
        )
    }
}
AssetHeightSelector.propTypes = {
    possibleHeights: PropTypes.array.isRequired,
    heightChange: PropTypes.func.isRequired,
    selected: PropTypes.string
}

class MarineSearchPrep extends React.Component {
    constructor(props) {
        super(props)

        this.possibleTargetsList = Object.keys(marineSweepWidths)
        this.possibleAssets = ["Boat", "Aircraft", "Heliocopter"]
        
        const defaultTargetData = marineSweepWidths[this.possibleTargetsList[0]]
        const defaultAsset = this.possibleAssets[0]
        const possibleDefaultAssetHeights = Object.keys(defaultTargetData[defaultAsset])

        this.state = {
            targetType: this.possibleTargetsList[0],
            targetData: defaultTargetData,
            assetType: defaultAsset,
            height: possibleDefaultAssetHeights[0],
            windSpeed: 0,
            visibility: 10,
            waveHeight: 0,
        }

        this.targetTypeChange = this.targetTypeChange.bind(this)
        this.windSpeedChange = this.windSpeedChange.bind(this)
        this.visibilityChange = this.visibilityChange.bind(this)
        this.waveHeightChange = this.waveHeightChange.bind(this)
        this.assetTypeChange = this.assetTypeChange.bind(this)
        this.heightChange = this.heightChange.bind(this)
    }

    targetTypeChange(newTargetType) {
        this.setState({ targetType: newTargetType, targetData: marineSweepWidths[newTargetType] })
    }

    windSpeedChange(event) {
        const target = event.target
        this.setState({ windSpeed: Number(target.value) })
    }

    visibilityChange(event) {
        const target = event.target
        this.setState({ visibility: Number(target.value) })
    }

    waveHeightChange(event) {
        const target = event.target
        this.setState({ waveHeight: target.value })
    }

    assetTypeChange(newAssetType) {
        this.setState({ assetType: newAssetType })
    }

    heightChange(newHeight) {
        this.setState({ height: newHeight })
    }

    render() {
        const visibleDistanceData = this.state.targetData[this.state.assetType][this.state.height]

        let highestSeenSweepWidth = 0
        let highestSeenVis = 0
        for (const idx in visibleDistanceData) {
            const data = visibleDistanceData[idx]
            if (data.vis <= this.state.visibility && data.vis > highestSeenVis) {
                highestSeenSweepWidth = data.sw
                highestSeenVis = data.vis
            }
        }

        let weatherImpact = 'low'
        if (this.state.windSpeed >= 25 || this.state.waveHeight >= 1.5) {
          weatherImpact = 'high'
        } else if (this.state.windSpeed >= 15 || this.state.seaHeight >= 1.0) {
          weatherImpact = 'medium'
        }
    
        const weatherCorrection = weatherCorrections[this.state.targetData.weather_corrections].IAMSAR[weatherImpact]

        return (
            <>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Target Object:</InputGroup.Text>
                    <TargetTypeSelector possible_targets={this.possibleTargetsList} targetTypeChange={this.targetTypeChange} selected={this.state.targetType} />
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Wind Speed (knots)</InputGroup.Text>
                    <Form.Control aria-label="Average Wind Speed in Knots" value={this.state.windSpeed} onChange={this.windSpeedChange} />
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Visibility (NM)</InputGroup.Text>
                    <Form.Control aria-label="Met Visibility in NM" value={this.state.visibility} onChange={this.visibilityChange} />
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Wave Height</InputGroup.Text>
                    <Form.Control aria-label="Average Wave Height in Meters" value={this.state.waveHeight} onChange={this.waveHeightChange} />
                </InputGroup>
                <InputGroup className='mb-3'>
                    <InputGroup.Text>Asset Type</InputGroup.Text>
                    <AssetTypeSelector possibleAssets={this.possibleAssets} assetTypeChange={this.assetTypeChange} selected={this.state.assetType} />
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Observer Height of Eye (ft)</InputGroup.Text>
                    <AssetHeightSelector possibleHeights={Object.keys(this.state.targetData[this.state.assetType])} heightChange={this.heightChange} selected={this.state.height} />
                </InputGroup>
                <h2>Uncorrected Sweep Width: {highestSeenSweepWidth}</h2>
                <h2>Weather Correction: {weatherCorrection}</h2>
                <h1>Resulting Sweep Width: {highestSeenSweepWidth * weatherCorrection}</h1>
            </>
        )
    }
}

export { MarineSearchPrep }
