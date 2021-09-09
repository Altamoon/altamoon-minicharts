import React, { ReactElement, useState } from 'react';
import { Row, Col } from 'reactstrap';
import styled from 'styled-components';

const RangeEdgeLabel = styled.span`
  font-size: 0.75rem;
  line-height: 1;
  top: -3px;
  position: relative;

  &.min { float: left; }
  &.max { float: right; }
`;

interface Props {
  label: string;
  min: number;
  max: number;
  id: string;
  value: number;
  onChange: (value: number) => void;
}

const InputRange = ({
  label,
  min,
  max,
  id,
  value,
  onChange,
}: Props): ReactElement => {
  const [currentValue, setCurrentValue] = useState(value);
  return (
    <Row>
      <Col xs={9}>
        <div className="nowrap">{label}</div>
      </Col>
      <Col xs={3} className="nowrap text-end">
        <label htmlFor={id}>{currentValue}</label>
      </Col>
      <Col xs={12} className="mb-3">
        <input
          type="range"
          className="form-range"
          value={currentValue}
          min={min}
          max={max}
          id={id}
          step={1}
          onChange={({ target }) => setCurrentValue(+target.value)}
          onMouseUp={() => onChange(currentValue)}
          onKeyDown={() => onChange(currentValue)}
        />
        <RangeEdgeLabel className="min text-muted">{min}</RangeEdgeLabel>
        <RangeEdgeLabel className="max text-muted">{max}</RangeEdgeLabel>
      </Col>
    </Row>
  );
};

export default InputRange;
