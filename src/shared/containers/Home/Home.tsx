import { Home } from 'Components/Home';
import { TestChart } from 'Containers/Charts';

const HomeContainer = function () {
  // Only render if our api call is not loading, there is no error and some photos have been returned
  return <Home title="Heeeeeeeeeeeeeeeeeee" />;
};

export { HomeContainer as Home };
