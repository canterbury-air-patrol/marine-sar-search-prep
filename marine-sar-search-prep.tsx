import React from "react";

import {
  marine_sweep_widths as marineSweepWidths,
  SearchTargetSweepWidthData,
  marine_sweep_width_weather_corrections as weatherCorrections,
} from "@canterbury-air-patrol/marine-sweep-width-data";

import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

interface TargetTypeSelectorProps {
  possible_targets: string[];
  targetTypeChange: (target: string) => void;
  selected: string;
}

class TargetTypeSelector extends React.Component<
  TargetTypeSelectorProps,
  never
> {
  constructor(props: TargetTypeSelectorProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const target = event.target;
    const value = target.value;

    this.props.targetTypeChange(value);
  }

  render() {
    const selectObjects = [];
    for (const idx in this.props.possible_targets) {
      const target = this.props.possible_targets[idx];
      selectObjects.push(
        <option key={target} value={target}>
          {target}
        </option>,
      );
    }
    return (
      <Form.Select
        defaultValue={this.props.selected}
        onChange={this.handleChange}
      >
        {selectObjects}
      </Form.Select>
    );
  }
}

interface AssetTypeSelectorProps {
  possibleAssets: string[];
  assetTypeChange: (assetType: string) => void;
  selected: string;
}

class AssetTypeSelector extends React.Component<AssetTypeSelectorProps, never> {
  constructor(props: AssetTypeSelectorProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const target = event.target;
    const value = target.value;

    this.props.assetTypeChange(value);
  }

  render() {
    const selectObjects = [];
    for (const idx in this.props.possibleAssets) {
      const assetType = this.props.possibleAssets[idx];
      selectObjects.push(
        <option key={assetType} value={assetType}>
          {assetType}
        </option>,
      );
    }
    return (
      <Form.Select
        defaultValue={this.props.selected}
        onChange={this.handleChange}
      >
        {selectObjects}
      </Form.Select>
    );
  }
}

interface AssetHeightSelectorProps {
  possibleHeights: string[];
  heightChange: (height: string) => void;
  selected: string;
}

class AssetHeightSelector extends React.Component<
  AssetHeightSelectorProps,
  never
> {
  constructor(props: AssetHeightSelectorProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const target = event.target;
    const value = target.value;

    this.props.heightChange(value);
  }

  render() {
    const selectObjects = [];
    for (const idx in this.props.possibleHeights) {
      const height = this.props.possibleHeights[idx];
      selectObjects.push(
        <option key={height} value={height}>
          {height}
        </option>,
      );
    }
    return (
      <Form.Select
        defaultValue={this.props.selected}
        onChange={this.handleChange}
      >
        {selectObjects}
      </Form.Select>
    );
  }
}

interface MarineSearchPrepState {
  targetType: string;
  targetData: SearchTargetSweepWidthData;
  assetType: string;
  height: string;
  windSpeed: number;
  visibility: number;
  waveHeight: number;
}

class MarineSearchPrep extends React.Component<object, MarineSearchPrepState> {
  possibleTargetsList: string[];
  possibleAssets: string[];

  constructor(props: object) {
    super(props);

    this.possibleTargetsList = Object.keys(marineSweepWidths);
    this.possibleAssets = ["Boat", "Aircraft", "Helicopter"];

    const defaultTargetData = marineSweepWidths[this.possibleTargetsList[0]];
    const defaultAsset = this.possibleAssets[0];
    const possibleDefaultAssetHeights = Object.keys(
      // @ts-expect-error confused about the usage of the key
      defaultTargetData[defaultAsset],
    );

    this.state = {
      targetType: this.possibleTargetsList[0],
      targetData: defaultTargetData,
      assetType: defaultAsset,
      height: possibleDefaultAssetHeights[0],
      windSpeed: 0,
      visibility: 10,
      waveHeight: 0,
    };

    this.targetTypeChange = this.targetTypeChange.bind(this);
    this.windSpeedChange = this.windSpeedChange.bind(this);
    this.visibilityChange = this.visibilityChange.bind(this);
    this.waveHeightChange = this.waveHeightChange.bind(this);
    this.assetTypeChange = this.assetTypeChange.bind(this);
    this.heightChange = this.heightChange.bind(this);
  }

  targetTypeChange(newTargetType: string) {
    this.setState({
      targetType: newTargetType,
      targetData: marineSweepWidths[newTargetType],
    });
  }

  windSpeedChange(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target;
    this.setState({ windSpeed: Number(target.value) });
  }

  visibilityChange(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target;
    this.setState({ visibility: Number(target.value) });
  }

  waveHeightChange(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target;
    this.setState({ waveHeight: parseFloat(target.value) });
  }

  assetTypeChange(newAssetType: string) {
    this.setState({ assetType: newAssetType });
  }

  heightChange(newHeight: string) {
    this.setState({ height: newHeight });
  }

  render() {
    const targetData =
      this.state.assetType == "Boat"
        ? this.state.targetData.Boat
        : this.state.assetType === "Helicopter"
          ? this.state.targetData.Helicopter
          : this.state.assetType === "Aircraft"
            ? this.state.targetData.Aircraft
            : null;
    const visibleDistanceData = targetData
      ? targetData[this.state.height]
      : null;

    let highestSeenSweepWidth = 0;
    let highestSeenVis = 0;
    if (visibleDistanceData) {
      for (const idx in visibleDistanceData) {
        const data = visibleDistanceData[idx];
        if (data.vis <= this.state.visibility && data.vis > highestSeenVis) {
          highestSeenSweepWidth = data.sw;
          highestSeenVis = data.vis;
        }
      }
    }

    let weatherImpact = "low";
    if (this.state.windSpeed >= 25 || this.state.waveHeight >= 1.5) {
      weatherImpact = "high";
    } else if (this.state.windSpeed >= 15 || this.state.waveHeight >= 1.0) {
      weatherImpact = "medium";
    }

    const weatherCorrectionsTable =
      this.state.targetData.weather_corrections === "large"
        ? weatherCorrections.large
        : weatherCorrections.small;
    const weatherCorrection =
      weatherImpact === "low" ||
      weatherImpact === "medium" ||
      weatherImpact === "high"
        ? weatherCorrectionsTable.IAMSAR[weatherImpact]
        : null;

    const inputs = [
      <InputGroup key="target_object" className="mb-3">
        <InputGroup.Text>Target Object:</InputGroup.Text>
        <TargetTypeSelector
          possible_targets={this.possibleTargetsList}
          targetTypeChange={this.targetTypeChange}
          selected={this.state.targetType}
        />
      </InputGroup>,
      <InputGroup key="wind_speed" className="mb-3">
        <InputGroup.Text>Wind Speed (knots)</InputGroup.Text>
        <Form.Control
          aria-label="Average Wind Speed in Knots"
          value={this.state.windSpeed}
          onChange={this.windSpeedChange}
        />
      </InputGroup>,
      <InputGroup key="visibility" className="mb-3">
        <InputGroup.Text>Visibility (NM)</InputGroup.Text>
        <Form.Control
          aria-label="Met Visibility in NM"
          value={this.state.visibility}
          onChange={this.visibilityChange}
        />
      </InputGroup>,
      <InputGroup key="wave_height" className="mb-3">
        <InputGroup.Text>Wave Height</InputGroup.Text>
        <Form.Control
          aria-label="Average Wave Height in Meters"
          value={this.state.waveHeight}
          onChange={this.waveHeightChange}
        />
      </InputGroup>,
      <InputGroup key="asset_type" className="mb-3">
        <InputGroup.Text>Asset Type</InputGroup.Text>
        <AssetTypeSelector
          possibleAssets={this.possibleAssets}
          assetTypeChange={this.assetTypeChange}
          selected={this.state.assetType}
        />
      </InputGroup>,
    ];

    if (targetData !== null) {
      inputs.push(
        <InputGroup key="height_of_eye" className="mb-3">
          <InputGroup.Text>Observer Height of Eye (ft)</InputGroup.Text>
          <AssetHeightSelector
            possibleHeights={Object.keys(targetData)}
            heightChange={this.heightChange}
            selected={this.state.height}
          />
        </InputGroup>,
      );
    }

    const outputs = [
      <h2 key="uncorrected_sw">
        Uncorrected Sweep Width: {highestSeenSweepWidth}
      </h2>,
    ];

    if (weatherCorrection !== null) {
      outputs.push(
        <h2 key="weather_correction_output">
          Weather Correction: {weatherCorrection}
        </h2>,
      );
      outputs.push(
        <h1 key="corrected_sweep_width">
          Resulting Sweep Width: {highestSeenSweepWidth * weatherCorrection!}
        </h1>,
      );
    }

    return (
      <>
        {inputs}
        {outputs}
      </>
    );
  }
}

export { MarineSearchPrep };
