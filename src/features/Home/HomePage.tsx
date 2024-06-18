import "./HomePage.css";

export function HomePage(){
    return (
        <div className="home-page">
            <div className="home-page-logo"></div>
            <h1 className="home-page-title">Enhance your <span className="brand-green brand-bold">day to day</span> communication</h1>
            <ul className="home-page-list">
                <li>Instant Messaging: <span className="brand-green brand-bold">Communicate instantly</span> with colleagues, no matter where they are.</li>
                <li>File Sharing: <span className="brand-green brand-bold">Share</span> documents and images with <span className="brand-green brand-bold">ease</span>.</li>
                <li>Organized Channels: <span className="brand-green brand-bold">Keep</span> conversations focused and projects <span className="brand-green brand-bold">organized</span>.</li>
                <li>Secure and Private: <span className="brand-green brand-bold">Enjoy</span> peace of mind with top-notch security and privacy features.</li>
            </ul>
        </div>
    );
}