import * as d3 from "d3";
import { useState, useEffect, useMemo } from "react";
import { bedtimeData2021 } from "./bedtimeData2021";
import { bedtimeData2023 } from "./bedtimeData2023";


// ==========================================
// 男女
// ==========================================

const Adult = [
    "男女",
    "男",
    "女",
];


// ==========================================
// 就寝時間・起床時間から睡眠時間を計算
// ==========================================

const calculateSleepHours = (bedtime, wakeup) => {

    if (!bedtime || !wakeup) {
        return null;
    }

    const [bedHour, bedMinute] = String(bedtime)
        .split(":")
        .map(Number);

    const [wakeHour, wakeMinute] = String(wakeup)
        .split(":")
        .map(Number);

    if (
        !Number.isFinite(bedHour) ||
        !Number.isFinite(bedMinute) ||
        !Number.isFinite(wakeHour) ||
        !Number.isFinite(wakeMinute)
    ) {
        return null;
    }

    let bed = bedHour * 60 + bedMinute;
    let wake = wakeHour * 60 + wakeMinute;

    // 日付をまたぐ場合
    if (wake <= bed) {
        wake += 24 * 60;
    }

    return (wake - bed) / 60;
};


// ==========================================
// 都道府県の順番
// ==========================================

const prefectures = [
    "北海道",
    "青森県",
    "岩手県",
    "宮城県",
    "秋田県",
    "山形県",
    "福島県",
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
    "新潟県",
    "富山県",
    "石川県",
    "福井県",
    "山梨県",
    "長野県",
    "岐阜県",
    "静岡県",
    "愛知県",
    "三重県",
    "滋賀県",
    "京都府",
    "大阪府",
    "兵庫県",
    "奈良県",
    "和歌山県",
    "鳥取県",
    "島根県",
    "岡山県",
    "広島県",
    "山口県",
    "徳島県",
    "香川県",
    "愛媛県",
    "高知県",
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
    "沖縄県"
];


export default function App() {

    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    const [guideStep, setGuideStep] = useState(() => {
        const seen = localStorage.getItem("guideSeen");
        return seen ? -1 : 0;
    });

    const [showLegend, setShowLegend] = useState(false);


    // ==========================================
    // 男女切り替え
    // ==========================================

    const [adult, setAdult] = useState("男");


    // ==========================================
    // 年度切り替え
    // ==========================================

    const [year, setYear] = useState("2023");


    // ==========================================
    // ホバー中のデータ
    // ==========================================

    const [hoveredData, setHoveredData] = useState(null);


    // ==========================================
    // ローディング
    // ==========================================

    useEffect(() => {

        const timer = setTimeout(() => {

            setFadeOut(true);

            setTimeout(() => {
                setLoading(false);
            }, 800);

        }, 2000);

        return () => clearTimeout(timer);

    }, []);


    // ==========================================
    // チュートリアル
    // ==========================================

    const closeGuide = () => {

        localStorage.setItem("guideSeen", "true");

        setGuideStep(-1);

    };


    // ==========================================
    // 選択した年度のデータ
    // ==========================================

    const currentData =
        year === "2021"
            ? bedtimeData2021
            : bedtimeData2023;


    // ==========================================
    // 都道府県別睡眠時間
    // ==========================================

    const sleepData = useMemo(() => {

        return prefectures

            .map(prefecture => {

                const data = currentData.find(
                    d =>
                        String(d["都道府県"]).trim() === prefecture &&
                        String(d["男女の別"]).trim() === adult
                );

                if (!data) {
                    return null;
                }

                const sleep = calculateSleepHours(
                    data["就寝"],
                    data["起床"]
                );

                return {
                    prefecture,
                    sleep,
                    bedtime: data["就寝"],
                    wakeup: data["起床"],
                    gender: data["男女の別"],
                    year: year
                };

            })

            .filter(d =>
                d !== null &&
                Number.isFinite(d.sleep)
            );

    }, [adult, year, currentData]);


    // ==========================================
    // グラフサイズ
    // ==========================================

    const chartWidth = 1400;
    const chartHeight = 600;

    const margin = {
        top: 60,
        right: 50,
        bottom: 130,
        left: 80
    };


    // ==========================================
    // X軸
    // ==========================================

    const xScale = d3
        .scalePoint()
        .domain(prefectures)
        .range([
            margin.left,
            chartWidth - margin.right
        ])
        .padding(0.5);


    // ==========================================
    // Y軸
    // ==========================================

    /*
     * ここは固定範囲にする。
     *
     * データ変更のたびにY軸そのものを作り直すと
     * グラフ全体が大きく動いて「ガクッ」と見えるため、
     * 余裕を持った固定範囲にしている。
     */

    const yScale = d3
        .scaleLinear()
        .domain([5.5, 9])
        .nice()
        .range([
            chartHeight - margin.bottom,
            margin.top
        ]);


    // ==========================================
    // 折れ線
    // ==========================================

    const line = d3
        .line()
        .x(d => xScale(d.prefecture))
        .y(d => yScale(d.sleep))
        .defined(d => Number.isFinite(d.sleep));


    // ==========================================
    // スライダー位置
    // ==========================================

    const yearIndex =
        year === "2021"
            ? 0
            : 1;


    const genderIndex =
        adult === "男"
            ? 0
            : adult === "女"
                ? 1
                : 2;


    return (
        <>

            {/* =====================================
                ローディング
            ===================================== */}

            {loading && (

                <div
                    className={`loading-screen ${fadeOut ? "fade-out" : ""
                        }`}
                >

                    <div className="loading-icon">
                        💤
                    </div>

                    <p>
                        読み込み中...
                    </p>

                </div>

            )}


            {/* =====================================
                メイン
            ===================================== */}

            <div
                className={`top ${loading
                    ? "main-hidden"
                    : "main-visible"
                    }`}
            >

                <div className="header">

                    <h1>
                        都道府県別で見る男女の睡眠時間

                        <span className="sleep-icon">
                            💤
                        </span>
                    </h1>


                    {/* =============================
                        ハンバーガーメニュー
                    ============================= */}

                    <div className="Legend">

                        <button
                            className="legendButton"
                            onClick={() =>
                                setShowLegend(!showLegend)
                            }
                        >
                            ≡
                        </button>


                        {showLegend && (

                            <div
                                className="legendMenu"
                                onMouseLeave={() =>
                                    setShowLegend(false)
                                }
                            >

                                <button
                                    onClick={() =>
                                        setGuideStep(0)
                                    }
                                >
                                    チュートリアル
                                </button>


                                <button
                                    onClick={() =>
                                        window.open(
                                            "https://forms.gle/Z36nduiANXahN9U99",
                                            "_blank"
                                        )
                                    }
                                >
                                    問い合わせ
                                </button>

                            </div>

                        )}

                    </div>

                </div>

            </div>


            {/* =====================================
                睡眠時間グラフ
            ===================================== */}

            <div className="bedtime">

                <h2>
                    {year}年 {adult}の都道府県別睡眠時間
                </h2>


                {/* =================================
                    年度切り替え
                ================================= */}

                <div
                    className={`year-toggle ${year === "2021"
                        ? "year-2021"
                        : "year-2023"
                        }`}
                >

                    {/* スライド背景 */}

                    <span
                        className="year-slider"
                        style={{
                            transform:
                                `translateX(${yearIndex * 100}%)`
                        }}
                    />


                    <button
                        onClick={() => {
                            setYear("2021");
                            setHoveredData(null);
                        }}
                        className={`year-btn ${year === "2021" ? "active" : ""}`}
                    >
                        2021年
                    </button>

                    <button
                        onClick={() => {
                            setYear("2023");
                            setHoveredData(null);
                        }}
                        className={`year-btn ${year === "2023" ? "active" : ""}`}
                    >
                        2023年
                    </button>

                </div>


                {/* =================================
                    グラフ
                ================================= */}

                <div className="sleep-graph">

                    <svg
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        width="100%"
                        height="600"
                    >

                        {/* =================================
                            Y軸・グリッド
                        ================================= */}

                        {yScale.ticks(7).map(tick => {

                            const y = yScale(tick);

                            return (

                                <g
                                    key={tick}
                                    className="chart-axis"
                                >

                                    <line
                                        x1={margin.left}
                                        x2={
                                            chartWidth -
                                            margin.right
                                        }
                                        y1={y}
                                        y2={y}
                                        stroke="#CBD5E1"
                                        strokeWidth="1"
                                    />


                                    <text
                                        x={
                                            margin.left - 15
                                        }
                                        y={y}
                                        textAnchor="end"
                                        dominantBaseline="middle"
                                        fill="black"
                                        fontSize="14"
                                    >
                                        {tick.toFixed(1)}
                                        時間
                                    </text>

                                </g>

                            );

                        })}


                        {/* =================================
                            折れ線
                        ================================= */}

                        {sleepData.length > 1 && (

                            <path
                                className="sleep-line"
                                d={line(sleepData)}
                                fill="none"
                                stroke="#818CF8"
                                strokeWidth="4"
                            />

                        )}


                        {/* =================================
                            データポイント
                        ================================= */}

                        {sleepData.map(d => {

                            const x =
                                xScale(d.prefecture);

                            const y =
                                yScale(d.sleep);

                            const isHovered =
                                hoveredData?.prefecture ===
                                d.prefecture;


                            return (

                                <g
                                    key={d.prefecture}
                                >

                                    {/* ==========================
                                        ホバー用透明円
                                    ========================== */}

                                    <circle
                                        className="hover-circle"
                                        cx={x}
                                        cy={y}
                                        r="14"
                                        fill="transparent"
                                        cursor="pointer"
                                        onMouseEnter={() =>
                                            setHoveredData(d)
                                        }
                                        onMouseLeave={() =>
                                            setHoveredData(null)
                                        }
                                    />


                                    {/* ==========================
                                        実際の円
                                    ========================== */}

                                    <circle
                                        className="data-circle"
                                        cx={x}
                                        cy={y}
                                        r={
                                            isHovered
                                                ? 10
                                                : 7
                                        }
                                        fill="#818CF8"
                                        stroke={
                                            isHovered
                                                ? "#4F46E5"
                                                : "none"
                                        }
                                        strokeWidth="3"
                                        pointerEvents="none"
                                    />


                                    {/* ==========================
                                        睡眠時間
                                    ========================== */}

                                    <text
                                        className="sleep-value"
                                        x={x}
                                        y={y - 15}
                                        textAnchor="middle"
                                        fill="black"
                                        fontSize="13"
                                        fontWeight="bold"
                                    >
                                        {d.sleep.toFixed(1)}
                                    </text>


                                    {/* ==========================
                                        都道府県名
                                    ========================== */}

                                    <text
                                        x={x}
                                        y={
                                            chartHeight -
                                            margin.bottom +
                                            25
                                        }
                                        textAnchor="end"
                                        transform={`rotate(
                                            -60,
                                            ${x},
                                            ${chartHeight -
                                            margin.bottom +
                                            25
                                            }
                                        )`}
                                        fill="black"
                                        fontSize="13"
                                    >
                                        {d.prefecture}
                                    </text>

                                </g>

                            );

                        })}


                        {/* =================================
                            ホバーツールチップ
                        ================================= */}

                        {hoveredData && (() => {

                            const x =
                                xScale(
                                    hoveredData.prefecture
                                );

                            const y =
                                yScale(
                                    hoveredData.sleep
                                );


                            const tooltipWidth = 220;
                            const tooltipHeight = 155;


                            let tooltipX =
                                x + 15;


                            if (
                                tooltipX +
                                tooltipWidth >
                                chartWidth -
                                margin.right
                            ) {

                                tooltipX =
                                    x -
                                    tooltipWidth -
                                    15;

                            }


                            let tooltipY =
                                y -
                                tooltipHeight -
                                15;


                            if (tooltipY < 10) {
                                tooltipY =
                                    y + 20;
                            }


                            return (

                                <g
                                    pointerEvents="none"
                                >

                                    <rect
                                        x={tooltipX}
                                        y={tooltipY}
                                        width={tooltipWidth}
                                        height={tooltipHeight}
                                        rx="10"
                                        fill="white"
                                        stroke="#818CF8"
                                        strokeWidth="2"
                                        opacity="0.97"
                                    />


                                    <text
                                        x={tooltipX + 15}
                                        y={tooltipY + 25}
                                        fill="#111827"
                                        fontSize="17"
                                        fontWeight="bold"
                                    >
                                        {hoveredData.prefecture}
                                    </text>


                                    <text
                                        x={tooltipX + 15}
                                        y={tooltipY + 48}
                                        fill="#475569"
                                        fontSize="13"
                                    >
                                        {hoveredData.year}年・
                                        {hoveredData.gender}
                                    </text>


                                    <text
                                        x={tooltipX + 15}
                                        y={tooltipY + 75}
                                        fill="#334155"
                                        fontSize="14"
                                    >
                                        就寝：
                                        {hoveredData.bedtime}
                                    </text>


                                    <text
                                        x={tooltipX + 15}
                                        y={tooltipY + 100}
                                        fill="#334155"
                                        fontSize="14"
                                    >
                                        起床：
                                        {hoveredData.wakeup}
                                    </text>


                                    <text
                                        x={tooltipX + 15}
                                        y={tooltipY + 130}
                                        fill="#4F46E5"
                                        fontSize="15"
                                        fontWeight="bold"
                                    >
                                        睡眠時間：
                                        {hoveredData.sleep.toFixed(1)}
                                        時間
                                    </text>

                                </g>

                            );

                        })()}


                        {/* =================================
                            Y軸タイトル
                        ================================= */}

                        <text
                            transform={`translate(
                                -10,
                                ${chartHeight / 2}
                            ) rotate(-90)`}
                            textAnchor="middle"
                            fill="black"
                            fontSize="16"
                        >
                            睡眠時間
                        </text>


                        {/* =================================
                            データなし
                        ================================= */}

                        {sleepData.length === 0 && (

                            <text
                                x={chartWidth / 2}
                                y={chartHeight / 2}
                                textAnchor="middle"
                                fill="#64748B"
                                fontSize="20"
                            >
                                データが見つかりません
                            </text>

                        )}

                    </svg>

                </div>


                {/* =====================================
                    男女切り替え
                ===================================== */}

                <div
                    className={`graph-toggle gender-${adult === "男"
                        ? "man"
                        : adult === "女"
                            ? "woman"
                            : "both"
                        }`}
                >

                    {/* スライド背景 */}

                    <span
                        className="gender-slider"
                        style={{
                            transform:
                                `translateX(${genderIndex * 100}%)`
                        }}
                    />


                    {[
                        {
                            key: "男",
                            label: "男"
                        },
                        {
                            key: "女",
                            label: "女"
                        },
                        {
                            key: "男女",
                            label: "男女"
                        }

                    ].map(btn => (

                        <button
                            key={btn.key}
                            onClick={() => {
                                setAdult(btn.key);
                                setHoveredData(null);
                            }}
                            className="toggle-btn"
                        >
                            {btn.label}
                        </button>

                    ))}

                </div>


                {/* =====================================
                    チュートリアル
                ===================================== */}

                {!loading && guideStep >= 0 && (

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
                                    fontWeight: "bold"
                                }}
                            >
                                ×
                            </button>


                            {/* =============================
                                チュートリアル1
                            ============================= */}

                            {guideStep === 0 && (

                                <>
                                    <h2>
                                        💤
                                        都道府県別に見る男女の睡眠時間サイトへようこそ！
                                    </h2>

                                    <p>
                                        このサイトでは、都道府県別の男女における就寝時間を可視化しています。
                                    </p>

                                    <img
                                        src="/guide1.png"
                                        alt="説明画像"
                                        className="guideImage"
                                    />
                                </>

                            )}


                            {/* =============================
                                チュートリアル2
                            ============================= */}

                            {guideStep === 1 && (

                                <>
                                    <h2>
                                        🗺 操作方法
                                    </h2>

                                    <ul>

                                        <li>
                                            「男・女・男女」から
                                            表示するデータを切り替えられます。
                                        </li>

                                        <li>
                                            「2021年・2023年」から
                                            表示する年度を切り替えられます。
                                        </li>

                                        <li>
                                            都道府県ごとの
                                            睡眠時間を比較できます。
                                        </li>

                                        <li>
                                            グラフの円にマウスを乗せると、
                                            詳細情報を確認できます。
                                        </li>

                                    </ul>

                                    <video
                                        src="/guide2.mp4"
                                        className="guideImage guideVideo"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                    />

                                </>

                            )}


                            {/* =============================
                                チュートリアル3
                            ============================= */}

                            {guideStep === 2 && (

                                <>
                                    <h2>
                                        📊 データの見方
                                    </h2>

                                    <ul>

                                        <li>
                                            就寝時間と起床時間から
                                            睡眠時間を算出しています。
                                        </li>

                                        <li>
                                            年度を切り替えることで、
                                            2021年と2023年の
                                            睡眠時間を比較できます。
                                        </li>

                                        <li>
                                            都道府県による
                                            睡眠時間の違いを確認できます。
                                        </li>

                                        <li>
                                            円にマウスを乗せることで、
                                            就寝時間・起床時間・睡眠時間を
                                            詳しく確認できます。
                                        </li>

                                    </ul>

                                </>

                            )}


                            {/* =============================
                                チュートリアルボタン
                            ============================= */}

                            <div className="guideButtons">

                                {guideStep > 0 && (

                                    <button
                                        onClick={() =>
                                            setGuideStep(
                                                guideStep - 1
                                            )
                                        }
                                    >
                                        ← 戻る
                                    </button>

                                )}


                                {guideStep < 2 ? (

                                    <button
                                        onClick={() =>
                                            setGuideStep(
                                                guideStep + 1
                                            )
                                        }
                                        style={{
                                            marginLeft: "auto"
                                        }}
                                    >
                                        次へ →
                                    </button>

                                ) : (

                                    <button
                                        onClick={closeGuide}
                                    >
                                        はじめる
                                    </button>

                                )}

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </>
    );
}