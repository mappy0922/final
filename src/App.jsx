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
    // 前年度データ
    // ==========================================

    const previousData =
        year === "2021"
            ? bedtimeData2023
            : bedtimeData2021;


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
    // 2021年の睡眠時間
    // ==========================================

    const sleepData2021 = useMemo(() => {

        return prefectures.map(prefecture => {

            const data = bedtimeData2021.find(
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
                sleep
            };

        }).filter(d =>
            d !== null &&
            Number.isFinite(d.sleep)
        );

    }, [adult]);


    // ==========================================
    // 2023年の睡眠時間
    // ==========================================

    const sleepData2023 = useMemo(() => {

        return prefectures.map(prefecture => {

            const data = bedtimeData2023.find(
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
                sleep
            };

        }).filter(d =>
            d !== null &&
            Number.isFinite(d.sleep)
        );

    }, [adult]);


    // ==========================================
    // 2021 → 2023 の変化量
    // ==========================================

    const yearChangeMap = useMemo(() => {

        const map = new Map();

        prefectures.forEach(prefecture => {

            const data2021 =
                sleepData2021.find(
                    d => d.prefecture === prefecture
                );

            const data2023 =
                sleepData2023.find(
                    d => d.prefecture === prefecture
                );

            if (
                data2021 &&
                data2023
            ) {

                map.set(
                    prefecture,
                    data2023.sleep - data2021.sleep
                );

            }

        });

        return map;

    }, [sleepData2021, sleepData2023]);


    // ==========================================
    // 現在年度の男女別データ
    // ==========================================

    const genderSleepData = useMemo(() => {

        const data =
            year === "2021"
                ? bedtimeData2021
                : bedtimeData2023;

        const map = new Map();

        prefectures.forEach(prefecture => {

            const maleData = data.find(
                d =>
                    String(d["都道府県"]).trim() === prefecture &&
                    String(d["男女の別"]).trim() === "男"
            );

            const femaleData = data.find(
                d =>
                    String(d["都道府県"]).trim() === prefecture &&
                    String(d["男女の別"]).trim() === "女"
            );

            const maleSleep = maleData
                ? calculateSleepHours(
                    maleData["就寝"],
                    maleData["起床"]
                )
                : null;

            const femaleSleep = femaleData
                ? calculateSleepHours(
                    femaleData["就寝"],
                    femaleData["起床"]
                )
                : null;

            if (
                Number.isFinite(maleSleep) &&
                Number.isFinite(femaleSleep)
            ) {

                map.set(
                    prefecture,
                    {
                        male: maleSleep,
                        female: femaleSleep,

                        // 男性 − 女性
                        difference: maleSleep - femaleSleep
                    }
                );

            }

        });

        return map;

    }, [year]);


    // ==========================================
    // 前年度の睡眠時間
    // ==========================================

    const previousSleepData = useMemo(() => {

        const previousYear =
            year === "2021"
                ? "2023"
                : "2021";

        return prefectures

            .map(prefecture => {

                const data = previousData.find(
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
                    year: previousYear
                };

            })

            .filter(d =>
                d !== null &&
                Number.isFinite(d.sleep)
            );

    }, [adult, year, previousData]);


    // ==========================================
    // ランキング
    // ==========================================

    const rankingData = useMemo(() => {

        const currentRanking = [...sleepData]
            .sort((a, b) => b.sleep - a.sleep)
            .map((d, index) => ({
                ...d,
                rank: index + 1
            }));


        const previousRanking = [...previousSleepData]
            .sort((a, b) => b.sleep - a.sleep)
            .map((d, index) => ({
                ...d,
                rank: index + 1
            }));


        const previousRankMap = new Map(
            previousRanking.map(d => [
                d.prefecture,
                d.rank
            ])
        );


        return currentRanking.map(d => {

            const previousRank =
                previousRankMap.get(d.prefecture);

            let rankChange = null;

            if (previousRank !== undefined) {
                rankChange = previousRank - d.rank;
            }

            return {
                ...d,
                previousRank,
                rankChange
            };

        });

    }, [sleepData, previousSleepData]);


    // ==========================================
    // TOP10
    // ==========================================

    const topRanking = rankingData.slice(0, 10);


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


    // ==========================================
    // 比較年度
    // ==========================================

    const comparisonYear =
        year === "2021"
            ? "2023"
            : "2021";


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
                            className={`year-btn ${year === "2021"
                                ? "active"
                                : ""
                                }`}
                        >
                            2021年
                        </button>


                        <button
                            onClick={() => {
                                setYear("2023");
                                setHoveredData(null);
                            }}
                            className={`year-btn ${year === "2023"
                                ? "active"
                                : ""
                                }`}
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

                                        {/* ホバー用透明円 */}

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


                                        {/* 実際の円 */}

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


                                        {/* 睡眠時間 */}

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


                                        {/* 都道府県名 */}

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


                                // -------------------------------
                                // 2021 → 2023 の変化量
                                // -------------------------------

                                const yearChange =
                                    yearChangeMap.get(
                                        hoveredData.prefecture
                                    );


                                // -------------------------------
                                // 男女差
                                // -------------------------------

                                const genderData =
                                    genderSleepData.get(
                                        hoveredData.prefecture
                                    );

                                const genderDifference =
                                    genderData?.difference;


                                // =================================
                                // ツールチップサイズ
                                // =================================

                                const tooltipWidth = 310;
                                const tooltipHeight = 225;


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


                                // -------------------------------
                                // 変化量の表示文字
                                // -------------------------------

                                let changeText = "―";
                                let changeColor = "#64748B";

                                if (
                                    Number.isFinite(yearChange)
                                ) {

                                    if (yearChange > 0) {

                                        changeText =
                                            `+${yearChange.toFixed(1)}時間増加`;

                                        changeColor =
                                            "#16A34A";

                                    } else if (
                                        yearChange < 0
                                    ) {

                                        changeText =
                                            `${yearChange.toFixed(1)}時間減少`;

                                        changeColor =
                                            "#DC2626";

                                    } else {

                                        changeText =
                                            "変化なし";

                                        changeColor =
                                            "#64748B";

                                    }

                                }


                                // -------------------------------
                                // 男女差の表示文字
                                // -------------------------------

                                let genderText = "―";
                                let genderColor = "#64748B";

                                if (
                                    Number.isFinite(
                                        genderDifference
                                    )
                                ) {

                                    /*
                                     * 男女差を小数第1位で表示するため、
                                     * ±0.05時間未満の場合は
                                     * 「0.0時間」と表示される。
                                     *
                                     * その場合は、
                                     * 「男女差なし」と表示する。
                                     */

                                    if (
                                        Math.abs(
                                            genderDifference
                                        ) < 0.05
                                    ) {

                                        genderText =
                                            "男女差なし";

                                        genderColor =
                                            "#64748B";

                                    } else if (
                                        genderDifference > 0
                                    ) {

                                        genderText =
                                            `+${genderDifference.toFixed(1)}時間（男性が長い）`;

                                        genderColor =
                                            "#2563EB";

                                    } else {

                                        genderText =
                                            `${genderDifference.toFixed(1)}時間（女性が長い）`;

                                        genderColor =
                                            "#DB2777";

                                    }

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


                                        {/* 都道府県 */}

                                        <text
                                            x={
                                                tooltipX +
                                                15
                                            }
                                            y={
                                                tooltipY +
                                                25
                                            }
                                            fill="#111827"
                                            fontSize="17"
                                            fontWeight="bold"
                                        >
                                            {
                                                hoveredData.prefecture
                                            }
                                        </text>


                                        {/* 年度・男女 */}

                                        <text
                                            x={
                                                tooltipX +
                                                15
                                            }
                                            y={
                                                tooltipY +
                                                48
                                            }
                                            fill="#475569"
                                            fontSize="13"
                                        >
                                            {
                                                hoveredData.year
                                            }年・{
                                                hoveredData.gender
                                            }
                                        </text>


                                        {/* 就寝 */}

                                        <text
                                            x={
                                                tooltipX +
                                                15
                                            }
                                            y={
                                                tooltipY +
                                                75
                                            }
                                            fill="#334155"
                                            fontSize="14"
                                        >
                                            就寝：
                                            {
                                                hoveredData.bedtime
                                            }
                                        </text>


                                        {/* 起床 */}

                                        <text
                                            x={
                                                tooltipX +
                                                15
                                            }
                                            y={
                                                tooltipY +
                                                100
                                            }
                                            fill="#334155"
                                            fontSize="14"
                                        >
                                            起床：
                                            {
                                                hoveredData.wakeup
                                            }
                                        </text>


                                        {/* 睡眠時間 */}

                                        <text
                                            x={
                                                tooltipX +
                                                15
                                            }
                                            y={
                                                tooltipY +
                                                130
                                            }
                                            fill="#4F46E5"
                                            fontSize="15"
                                            fontWeight="bold"
                                        >
                                            睡眠時間：
                                            {
                                                hoveredData.sleep.toFixed(
                                                    1
                                                )
                                            }
                                            時間
                                        </text>


                                        {/* 区切り線 */}

                                        <line
                                            x1={
                                                tooltipX +
                                                15
                                            }
                                            x2={
                                                tooltipX +
                                                tooltipWidth -
                                                15
                                            }
                                            y1={
                                                tooltipY +
                                                145
                                            }
                                            y2={
                                                tooltipY +
                                                145
                                            }
                                            stroke="#E5E7EB"
                                        />


                                        {/* 2021 → 2023 */}

                                        <text
                                            x={
                                                tooltipX +
                                                15
                                            }
                                            y={
                                                tooltipY +
                                                168
                                            }
                                            fill="#334155"
                                            fontSize="13"
                                        >
                                            2021年 → 2023年：
                                        </text>


                                        <text
                                            x={
                                                tooltipX +
                                                165
                                            }
                                            y={
                                                tooltipY +
                                                168
                                            }
                                            fill={changeColor}
                                            fontSize="13"
                                            fontWeight="bold"
                                        >
                                            {changeText}
                                        </text>


                                        {/* 男女差 */}

                                        <text
                                            x={
                                                tooltipX +
                                                15
                                            }
                                            y={
                                                tooltipY +
                                                195
                                            }
                                            fill="#334155"
                                            fontSize="13"
                                        >
                                            男女差（男−女）：
                                        </text>


                                        <text
                                            x={
                                                tooltipX +
                                                165
                                            }
                                            y={
                                                tooltipY +
                                                195
                                            }
                                            fill={genderColor}
                                            fontSize="13"
                                            fontWeight="bold"
                                        >
                                            {genderText}
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
                                    x={
                                        chartWidth / 2
                                    }
                                    y={
                                        chartHeight / 2
                                    }
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
                                className={`toggle-btn ${adult === btn.key
                                    ? "active"
                                    : ""
                                    }`}
                            >
                                {btn.label}
                            </button>

                        ))}

                    </div>


                    {/* =====================================
                        ランキング
                    ===================================== */}

                    <div className="ranking-section">

                        <h2>
                            🏆 {year}年 {adult}の睡眠時間ランキング
                        </h2>


                        <p className="ranking-description">
                            睡眠時間が長い都道府県ほど上位に表示しています。
                            <br />
                            順位変化は
                            {comparisonYear}年のランキングと比較しています。
                        </p>


                        <div className="ranking-list">

                            {topRanking.map((d, index) => {

                                const rank = d.rank;

                                const change =
                                    d.rankChange;


                                return (

                                    <div
                                        className="ranking-item"
                                        key={d.prefecture}
                                        style={{
                                            transitionDelay:
                                                `${index * 0.04}s`
                                        }}
                                    >

                                        <div
                                            className={`ranking-number rank-${rank}`}
                                        >
                                            {rank}
                                        </div>


                                        <div className="ranking-prefecture">

                                            <div className="ranking-prefecture-name">
                                                {d.prefecture}
                                            </div>

                                            <div className="ranking-sleep">
                                                睡眠時間
                                                <strong>
                                                    {d.sleep.toFixed(1)}
                                                </strong>
                                                時間
                                            </div>

                                        </div>


                                        <div
                                            className={`ranking-change ${change > 0
                                                ? "rank-up"
                                                : change < 0
                                                    ? "rank-down"
                                                    : "rank-same"
                                                }`}
                                        >

                                            {change > 0 && (
                                                <>
                                                    ↑ {change}位上昇
                                                </>
                                            )}

                                            {change < 0 && (
                                                <>
                                                    ↓ {
                                                        Math.abs(change)
                                                    }位下降
                                                </>
                                            )}

                                            {change === 0 && (
                                                <>
                                                    → 順位変化なし
                                                </>
                                            )}

                                            {change === null && (
                                                <>
                                                    ―
                                                </>
                                            )}

                                        </div>

                                    </div>

                                );

                            })}

                        </div>


                        {topRanking.length === 0 && (

                            <div className="ranking-empty">
                                ランキングデータがありません
                            </div>

                        )}

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

                                            <li>
                                                睡眠時間ランキングから
                                                都道府県の順位と順位変化を確認できます。
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

                                            <li>
                                                2021年から2023年までの
                                                睡眠時間の変化量を確認できます。
                                            </li>

                                            <li>
                                                男性と女性の睡眠時間の差も
                                                確認できます。
                                            </li>

                                            <li>
                                                ランキングでは、
                                                睡眠時間が長い都道府県ほど
                                                上位に表示されます。
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

            </div>

        </>
    );
}