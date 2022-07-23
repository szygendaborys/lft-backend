export class DateUtils {
  static checkIfTimePassed({
    fromDate,
    secondsToPass,
  }: {
    fromDate: Date;
    secondsToPass: number;
  }): boolean {
    const msToPass = secondsToPass * 1000;
    const now = new Date();

    return now.getTime() - fromDate.getTime() >= msToPass;
  }

  static countTimeDifferenceInSeconds({
    fromDate,
    toDate,
  }: {
    fromDate: Date;
    toDate: Date;
  }): number {
    return Math.abs((toDate.getTime() - fromDate.getTime()) / 1000);
  }

  static checkIfTimestampExpired(timestamp: number): boolean {
    const now = Date.now();
    const timeDiff = timestamp - now;
    return timeDiff <= 0;
  }
}
