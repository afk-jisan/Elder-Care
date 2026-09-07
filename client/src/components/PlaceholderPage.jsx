import { Link } from 'react-router-dom';

export default function PlaceholderPage({ title, featureId, nextStep }) {
  return (
    <div>
      <p className="muted">
        This page is reserved for {featureId}. Shared navigation is ready;
        feature work lands on the matching feature branch.
      </p>
      {nextStep && <p>{nextStep}</p>}
      <p>
        <Link to="..">Back to overview</Link>
      </p>
    </div>
  );
}
