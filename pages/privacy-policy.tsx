import React from 'react';
import { useRouter } from 'next/router';

const Confirmation = () => {
    const router = useRouter();
    return (
        <div className='container green'>
            <h1 className='text-white'>Privacy Policy</h1>
            <div>
                <p className="text-white">
                    We are an in-house service of Swirl Creative. We share the same base privacy policy which can be found here: <a target="_blank" href="https://swirlwebdesign.com/privacy-policy/">Privacy Policy</a>
                </p>
                <p className="text-white">
                    On this site, we also utilize the following third-party services to better serve our customers:
                </p>
                <ul>
                    <li>
                        <a target="_blank" href="https://policies.google.com/privacy">Google Analytics</a>
                    </li>
                    <li>
                        <a target="_blank" href="https://openai.com/privacy/">OpenAI API</a>
                    </li>
                </ul>
            </div>
            <button onClick={() => router.push({ pathname: '/' })}>Back Home</button>
        </div>
    );
}

export default Confirmation;
