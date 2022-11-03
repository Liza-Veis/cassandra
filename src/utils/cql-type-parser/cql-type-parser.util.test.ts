import { CQLDataType } from '~/common/enums/enums';

import { CQLTypeParser } from './cql-type-parser.util';

describe('CQLTypeParser', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('checkIsType', () => {
    it('Should check if string of type', async () => {
      const result = CQLTypeParser.checkIsType(
        'map<int, string>',
        CQLDataType.MAP,
      );

      expect(result).toBeTruthy();
    });
  });

  describe('getInnerTypes', () => {
    it('Should return inner types', async () => {
      const result = CQLTypeParser.getInnerTypes(
        'map<int, tuple<string, date>>',
      );

      expect(result).toEqual(['int', 'tuple<string, date>']);
    });
  });

  describe('getNestedType', () => {
    it('Should return nested type', async () => {
      const result = CQLTypeParser.getNestedType(CQLDataType.MAP, [
        'int',
        'string',
      ]);

      expect(result).toEqual('map<int, string>');
    });
  });
});
