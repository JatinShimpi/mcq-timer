import { useNavigate } from 'react-router-dom';
import { Button } from 'react-aria-components';

export default function ComingSoon() {
    const navigate = useNavigate();

    return (
        <div className="coming-soon-page">
            <div className="coming-soon-content">
                <div className="coming-soon-icon">📱</div>
                <h1 className="coming-soon-title">Coming Soon!</h1>
                <p className="coming-soon-description">
                    We're working hard to bring Qlock to the Play Store.
                    Stay tuned for our mobile app!
                </p>
                <div className="coming-soon-features">
                    <div className="coming-soon-feature">
                        <span>✓</span> Practice on the go
                    </div>
                    <div className="coming-soon-feature">
                        <span>✓</span> Offline mode
                    </div>
                    <div className="coming-soon-feature">
                        <span>✓</span> Push notifications
                    </div>
                    <div className="coming-soon-feature">
                        <span>✓</span> Native performance
                    </div>
                </div>
                <div className="coming-soon-actions">
                    <Button className="btn btn-primary" onPress={() => navigate('/app')}>
                        Use Web App Instead
                    </Button>
                    <Button className="btn btn-secondary" onPress={() => navigate('/')}>
                        ← Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
