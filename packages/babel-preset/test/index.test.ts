import * as babel from '@babel/core';
import { preset } from '../src/index';

describe('Custom Babel Preset', () => {
  it('transforms ES6 code to ES5 as expected', () => {
    const code = 'const a = 1; let b = 2;';
    const result = babel.transform(code, {
      presets: [
        preset
      ],
    });

    expect(result?.code).toMatchSnapshot();
  });

  it('transforms JSX to React.createElement', () => {
    const jsxCode = '<div>Hello, world!</div>';
    const result = babel.transform(jsxCode, {
      presets: [
        preset
      ],
    });

    expect(result?.code).toMatchSnapshot();
  });
});
