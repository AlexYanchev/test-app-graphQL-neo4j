import { FC } from 'react';
import styles from './BusinessResults.module.css';
import { BusinessType } from '../../App';
import { starredVar } from '../..';
import { useSessionData } from '../hooks/useSessionData';

type Props = {
  businesses: Array<BusinessType>;
};

const BusinessResults: FC<Props> = ({ businesses }) => {
  const starredBusinesses = starredVar();
  const { isValid } = useSessionData();

  return (
    <div>
      <h2>Results</h2>
      <table className={styles.table_results_container}>
        <thead>
          <tr>
            <th>mark</th>
            <th>Name</th>
            <th>Address</th>
            <th>Category</th>
            {isValid && <th>Average Stars</th>}
          </tr>
        </thead>
        <tbody>
          {businesses.map((b, i) => (
            <tr key={i}>
              <td>
                <button
                  type='button'
                  onClick={() => {
                    if (!b.isStarred) {
                      starredVar([...starredBusinesses, b.businessId]);
                    } else {
                      starredVar(
                        starredBusinesses.filter(
                          (businessId) => businessId !== b.businessId
                        )
                      );
                    }
                  }}
                >
                  {b.isStarred ? 'del Star' : 'Star'}
                </button>
              </td>
              <td style={b.isStarred ? { fontWeight: 'bold' } : {}}>
                {b.name}
              </td>
              <td>{b.address}</td>
              <td>{b.categories.map((c) => c.name).join(', ')}</td>
              {isValid && <td>{b.averageStars}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default BusinessResults;
