'use babel';

import conditionFactoryProvider from './condition-factory-provider';
import snippetProvider from './snippet-provider';
export default {
  getProvider() {
          // return a single provider, or an array of providers to use together
          return [conditionFactoryProvider, snippetProvider];
      }
};
