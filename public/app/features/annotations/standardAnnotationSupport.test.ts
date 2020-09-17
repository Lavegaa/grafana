import { FieldType, toDataFrame } from '@grafana/data';
import { getAnnotationsFromData } from './standardAnnotationSupport';
import { observableTester } from '../../../test/helpers/observableTester';

describe('DataFrame to annotations', () => {
  test('simple conversion', done => {
    const frame = toDataFrame({
      fields: [
        { type: FieldType.time, values: [1, 2, 3] },
        { name: 'first string field', values: ['t1', 't2', 't3'] },
        { name: 'tags', values: ['aaa,bbb', 'bbb,ccc', 'zyz'] },
      ],
    });

    observableTester().subscribeAndExpectOnNext({
      observable: getAnnotationsFromData([frame]),
      expect: events => {
        expect(events).toEqual([
          {
            tags: ['aaa', 'bbb'],
            text: 't1',
            time: 1,
          },
          {
            tags: ['bbb', 'ccc'],
            text: 't2',
            time: 2,
          },
          {
            tags: ['zyz'],
            text: 't3',
            time: 3,
          },
        ]);
      },
      done,
    });
  });

  test('explicit mappins', done => {
    const frame = toDataFrame({
      fields: [
        { name: 'time1', values: [111, 222, 333] },
        { name: 'time2', values: [100, 200, 300] },
        { name: 'aaaaa', values: ['a1', 'a2', 'a3'] },
        { name: 'bbbbb', values: ['b1', 'b2', 'b3'] },
      ],
    });

    observableTester().subscribeAndExpectOnNext({
      observable: getAnnotationsFromData([frame], {
        text: { value: 'bbbbb' },
        time: { value: 'time2' },
        timeEnd: { value: 'time1' },
        title: { value: 'aaaaa' },
      }),
      expect: events => {
        expect(events).toEqual([
          {
            text: 'b1',
            time: 100,
            timeEnd: 111,
            title: 'a1',
          },
          {
            text: 'b2',
            time: 200,
            timeEnd: 222,
            title: 'a2',
          },
          {
            text: 'b3',
            time: 300,
            timeEnd: 333,
            title: 'a3',
          },
        ]);
      },
      done,
    });
  });
});
