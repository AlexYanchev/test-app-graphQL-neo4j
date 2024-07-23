import { FC } from 'react';
import styles from './BusinessSearch.module.css';
import { OperationVariables, ApolloQueryResult } from '@apollo/client';

type Props = {
  criteries: string[];
  selectedCriteria: string | string[];
  setSelectedCriteria: React.Dispatch<React.SetStateAction<string[]>>;
  title: string;
  multipleSelected?: boolean;
  refetch: (
    variables?: Partial<OperationVariables> | undefined
  ) => Promise<ApolloQueryResult<any>>;
};

const BusinessSearch: FC<Props> = ({
  criteries,
  selectedCriteria,
  setSelectedCriteria,
  title,
  multipleSelected,
  refetch,
}) => {
  return (
    <div>
      <h3>{title}</h3>
      <form>
        <label>
          Select Business Criteria
          <select
            defaultValue={selectedCriteria}
            onChange={(e) => {
              const stringFromOptionsValues = Array.from(
                e.currentTarget.selectedOptions
              ).map((o) => o.value);

              setSelectedCriteria(stringFromOptionsValues);
            }}
            multiple={multipleSelected}
          >
            {criteries.map((c, i) => {
              return (
                <option key={i} value={c}>
                  {c}
                </option>
              );
            })}
          </select>
        </label>
        <button
          onClick={(e) => {
            e.preventDefault();
            refetch();
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
};
export default BusinessSearch;
