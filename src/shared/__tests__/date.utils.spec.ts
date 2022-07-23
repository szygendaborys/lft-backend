import * as faker from 'faker';
import { DateUtils } from './../date.utils';
describe('Date utils unit tests', () => {
  describe('checkIfTimePassed', () => {
    it('Should state that the time has not passed', () => {
      const fromDate = new Date();

      const secondsToPass = faker.datatype.number();

      const result = DateUtils.checkIfTimePassed({ fromDate, secondsToPass });

      expect(result).toBeFalsy();
    });

    it('Should state that the time has already passed', () => {
      const secondsToPass = faker.datatype.number();
      const fromDate = new Date();
      fromDate.setSeconds(fromDate.getSeconds() - secondsToPass);

      const result = DateUtils.checkIfTimePassed({ fromDate, secondsToPass });

      expect(result).toBeTruthy();
    });
  });
  describe('countTimeDifferenceInSeconds', () => {
    it('should count correct date ', () => {
      const fromDate = new Date(2022, 2, 2);
      const toDate = new Date(2022, 2, 3);

      const result = DateUtils.countTimeDifferenceInSeconds({
        fromDate,
        toDate,
      });

      expect(result).toBe(24 * 60 * 60);
    });

    it('should count correct date even if toDate is before fromDate', () => {
      const toDate = new Date(2022, 2, 2);
      const fromDate = new Date(2022, 2, 3);

      const result = DateUtils.countTimeDifferenceInSeconds({
        fromDate,
        toDate,
      });

      expect(result).toBe(24 * 60 * 60);
    });
  });
});
