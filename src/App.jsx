import * as d3 from "d3";
import { useMemo } from "react";
import { useState, useEffect, useRef } from "react";
import { bedtimeData } from "./bedtimeDataFile";

export default function App() {
    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [guideStep, setGuideStep] = useState(() => {
        const seen = localStorage.getItem("guideSeen");
        return seen ? -1 : 0;
    });
    const [showLegend, setShowLegend] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true);

            // フェードアウトが終わってからローディング画面を消す
            setTimeout(() => {
                setLoading(false);
            }, 800);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const closeGuide = () => {
        localStorage.setItem("guideSeen", "true");
        setGuideStep(-1);
    };

    return (
        <>
            {loading && (
                <div className={`loading-screen ${fadeOut ? "fade-out" : ""}`}>
                    <div className="loading-icon">💤</div>
                    <p>読み込み中...</p>
                </div>
            )}

            <div className={`top ${loading ? "main-hidden" : "main-visible"}`}>
                <div className="header">
                    <h1>
                        都道府県別に見る男女の就寝時間
                        <span className="sleep-icon">💤</span>
                    </h1>

                    <div className="Legend">
                        <button
                            className="legendButton"
                            onClick={() => {
                                setShowLegend(!showLegend);
                                (showMenu ? setShowMenu(!showMenu) : "");
                            }}
                        >
                            ≡
                        </button>

                        {showLegend && (
                            <div className="legendMenu"
                                onMouseLeave={() => setShowLegend(!showLegend)}>
                                <>
                                    <button
                                        onClick={() => {
                                            setGuideStep(0);
                                        }}
                                    >
                                        チュートリアル
                                    </button>

                                    <button onClick={() => (window.open('https://forms.gle/SbZTWNMnHowPE7R38', '_blank'))}>
                                        問い合わせ
                                    </button>
                                </>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bedtime">
                <h2>男性の都道府県別における就寝時間</h2>
            </div>

            <div className="legend">
                <h2>ラベル選択肢</h2>
            </div>

            {/*　チュートリアル */}
            {
                !loading && guideStep >= 0 && (
                    <div className="guideOverlay">
                        <div className="guideModal">
                            <button
                                onClick={closeGuide}
                                style={{
                                    position: "absolute",
                                    top: "12px",
                                    right: "12px",
                                    width: "32px",
                                    height: "32px",
                                    border: "none",
                                    borderRadius: "50%",
                                    background: "#f0f0f0",
                                    cursor: "pointer",
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                }}
                            >
                                ×
                            </button>

                            {guideStep === 0 && (
                                <>
                                    <h2>🚄 都道府県別に見る男女の就寝時間サイトへようこそ！</h2>

                                    <p>
                                        このサイトでは、日本国内の人の移動データを
                                        地図上で可視化しています。
                                    </p>

                                    <img
                                        src="/guide2.png"
                                        alt="説明画像"
                                        className="guideImage"
                                    />
                                </>
                            )}

                            {guideStep === 1 && (
                                <>
                                    <h2>🗺 地図の操作方法</h2>

                                    <ul>
                                        <li>県をクリックすると選択地点を変更できます。</li>
                                        <li>下のボタンで条件を満たす来客者数ごとの絞り込みが出来ます</li>
                                        <li>それぞれの都道府県をタップすることで、その詳細を見ることが出来ます</li>
                                    </ul>

                                    <img
                                        src="/guide1.png"
                                        alt="操作方法"
                                        className="guideImage"
                                    />
                                </>
                            )}

                            {guideStep === 2 && (
                                <>
                                    <h2>📊 データの見方</h2>

                                    <div
                                        style={{
                                            width: "100%",
                                            maxWidth: "100%",
                                            overflowX: "hidden",
                                        }}
                                    >
                                        <ul
                                            style={{
                                                paddingLeft: "20px",
                                                lineHeight: "1.8",
                                                wordBreak: "break-word",
                                                overflowWrap: "break-word",
                                            }}
                                        >
                                            <li>選択地点への来訪人数を前年度と比較できます。</li>
                                            <li>移動目的・交通手段ごとの来訪人数を前年度と比較できます。</li>
                                            <li>対象地点から選択地点への移動目的・交通手段の割合を確認できます。</li>
                                            <li>選択地点へ来る人数ランキングを確認できます。</li>
                                        </ul>

                                        <img
                                            src="/guide3.png"
                                            alt="データの見方"
                                            className="guideImage"
                                            style={{
                                                width: "100%",
                                                maxWidth: "100%",
                                                height: "auto",
                                                display: "block",
                                                marginTop: "10px",
                                                borderRadius: "8px",
                                            }}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="guideButtons">

                                {guideStep > 0 && (
                                    <button onClick={() => setGuideStep(guideStep - 1)}>
                                        ← 戻る
                                    </button>
                                )}

                                {guideStep < 2 ? (
                                    <button
                                        onClick={() => setGuideStep(guideStep + 1)}
                                        style={{ marginLeft: "auto" }}
                                    >
                                        次へ →
                                    </button>
                                ) : (
                                    <button onClick={closeGuide}>
                                        はじめる
                                    </button>
                                )}

                            </div>

                        </div>
                    </div>
                )
            }
        </>
    );
}