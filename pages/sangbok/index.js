import { readFileSync } from "node:fs";
import CustomHead from "@/components/CustomHead";
import TextHighlighter from "@/components/Highlighter";
import { logEvent } from "firebase/analytics";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import filterStyles from "@/styles/filter-panel.module.css";
import styles from "@/styles/sangbok.module.css";

import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

//göm majjelåtar mellan månad 6 och 9
function HideDate(currentMonth) {
	if (currentMonth < 5 || currentMonth > 8) {
		return false;
	}
	return true;
}

// 2023-08-04, Tar bort alternativet för fulltext-search då jag inte har hunnit göra klart det. -Armin

export default function Sangbok({ sånger, index }) {
	const [sortedSongs, setSortedSongs] = useState(
		[...sånger].sort(
			(a, b) => Number.parseInt(a.sida, 10) - Number.parseInt(b.sida, 10),
		),
	);

	const [fulltextSearchResults, setFulltextSearchResults] = useState([]);
	const [searchFullText, setSearchFullText] = useState(false);

	const [sort, setSort] = useState("pageNr");
	const sortBy = (e) => {
		setSort(e.target.value);
	};

	useEffect(() => {
		if (sort === "category") {
			setSortedSongs(
				[...sånger].sort((a, b) => a.kategori.localeCompare(b.kategori, "sv")),
			);
		} else if (sort === "pageNr") {
			setSortedSongs(
				[...sånger].sort(
					(a, b) => Number.parseInt(a.sida, 10) - Number.parseInt(b.sida, 10),
				),
			);
		} else {
			setSortedSongs(
				[...sånger].sort((a, b) => a.title.localeCompare(b.title, "sv")),
			);
		}
	}, [sort, sånger]);

	const [search, setSearch] = useState("");
	const currentMonth = new Date().getMonth();

	const [filterPanelOpen, setFilterPanelOpen] = useState(false);
	const [fokusSearchBar, setFokusSearchBar] = useState(false);

	useEffect(() => {
		const focusSearchHandler = (e) => {
			if (!fokusSearchBar && e.target.className === "searchbar") {
				setFokusSearchBar(true);
			} else if (fokusSearchBar && e.target.className !== "searchbar") {
				setFokusSearchBar(false);
			}
		};

		document.addEventListener("mousedown", focusSearchHandler);
		return () => {
			document.removeEventListener("mousedown", focusSearchHandler);
		};
	});

	//WIP
	useEffect(() => {
		const contentindex = new Map(Object.entries(index));
		const sanitizeExpression = /[#_:.,*|/\"\'\\!?()[\]\{\}+’´']/gm;
		const wordsArray = search
			.replaceAll(sanitizeExpression, "")
			.trim()
			.split(" ");

		//console.log(wordsArray)
		let results = contentindex.has(wordsArray[0])
			? contentindex.get(wordsArray[0]).split(" ")
			: [];

		if (results) {
			for (let i = 1; i < wordsArray.length; i++) {
				const word = wordsArray[i];

				// Check if the key exists in the hashmap
				if (contentindex.has(word)) {
					const newRes = contentindex.get(word).split(" ");
					results = results.filter((elem) => newRes.includes(elem));
				} else {
					results = [];
					break;
				}
			}
		}
		//console.log(results)
		setFulltextSearchResults(results);
	}, [index, search]);

	const panelRef = useRef();
	//Stänger filterpanelen om man trycker utanför
	useEffect(() => {
		const panelCloseHandler = (e) => {
			const clickOnPanel = e.composedPath().includes(panelRef.current);
			if (!clickOnPanel) {
				setFilterPanelOpen(false);
			}
		};

		document.addEventListener("mousedown", panelCloseHandler);
		return () => {
			document.removeEventListener("mousedown", panelCloseHandler);
		};
	});

	const SångLänk = ({ sång }) => {
		// Döljer bla majjelåtar under vår/sommar
		if (sång.hemlig && HideDate(currentMonth)) {
			return "";
		}
		return (
			<Link
				href={`/sangbok${sång.href}`}
				className={styles.songLink}
				referrerPolicy="hej"
			>
				<div>
					<span className={styles.songTitle}>
						<TextHighlighter search={search} text={sång.title} />
					</span>
					<span className={styles.songPage}>&nbsp; s.{sång.sida}</span>
				</div>
				<div className={styles.songCategory}>&nbsp; {sång.kategori}</div>
			</Link>
		);
	};

	return (
		<>
			<CustomHead
				metaTitle={"Sångbok | Sektionen för Civilingenjör och Lärare"}
				description={"Sektionens digitala sångbok."}
				url={"https://www.cl-sektionen.se/sangbok"}
			/>
			<div id="contentbody">
				<div className="small-header">
					<h1 id="page-title">Sångbok</h1>
					<p>
						Nedan finner du samtliga sånger från sektionens officiella sångbok
						som trycktes inför sektionens 20-årsjubileum. Fysisk kopia av
						sångboken finns att köpa för 130 kr. Prata med försäljningsansvarig!
					</p>
				</div>

				<div className={styles.songbookWrapper}>
					<div className={filterStyles.panelWrapper} ref={panelRef}>
						<div className={`inputfält ${fokusSearchBar ? "active" : ""}`}>
							<input
								type="text"
								placeholder="Sök efter inlägg..."
								onChange={(e) => {
									setSearch(e.target.value);
								}}
								onBlur={async () => {
									// När användaren lämnar sökrutan
									const { getAnalytics } = await import(
										"../../firebase/clientApp"
									);
									const analytics = await getAnalytics();
									if (analytics) {
										logEvent(analytics, "search", { search_term: search });
									}
								}}
								className="searchbar"
							/>
							<button
								type="button"
								className={`${filterStyles.filterOpen} ${
									filterPanelOpen ? filterStyles.active : ""
								}`}
								onClick={() => {
									setFilterPanelOpen(!filterPanelOpen);
								}}
							>
								<FontAwesomeIcon icon={faEllipsis} />
							</button>
						</div>

						<section
							className={`${filterStyles.panel} ${
								filterPanelOpen ? filterStyles.open : filterStyles.collapsed
							}`}
						>
							<div className={filterStyles.innerWrapper}>
								<label>
									<input
										type="radio"
										name="filters"
										value="pageNr"
										checked={sort === "pageNr"}
										onChange={(e) => sortBy(e)}
										className={filterStyles.filterInput}
									/>
									<span className={filterStyles.filterOption}>
										Sortera på sidnummer
									</span>
								</label>
								<label>
									<input
										type="radio"
										name="filters"
										value="alphabetical"
										checked={sort === "alphabetical"}
										onChange={(e) => sortBy(e)}
										className={filterStyles.filterInput}
									/>
									<span className={filterStyles.filterOption}>
										Sortera alfabetiskt
									</span>
								</label>
								<label>
									<input
										type="radio"
										name="filters"
										value="category"
										checked={sort === "category"}
										onChange={(e) => sortBy(e)}
										className={filterStyles.filterInput}
									/>
									<span className={filterStyles.filterOption}>
										Sortera på kategori
									</span>
								</label>
							</div>
						</section>
					</div>

					<div>
						{sortedSongs
							.filter(
								(sång) =>
									search === "" ||
									sång.title.toLowerCase().includes(search.toLowerCase()) ||
									sång.altSearch?.some((title) =>
										title.toLowerCase().includes(search.toLowerCase()),
									) ||
									(searchFullText &&
										fulltextSearchResults.some((elem) =>
											elem.includes(sång.href.slice(-1)),
										)),
							)
							.map((sång) => (
								<SångLänk key={sång.href} sång={sång} />
							))}
					</div>
				</div>
			</div>
		</>
	);
}

export async function getStaticProps() {
	const sånger = JSON.parse(readFileSync("content/data/sangbok-index.json"));
	const index = JSON.parse(
		readFileSync("content/data/sangbok-content-index.json"),
	);

	return {
		props: { sånger, index },
	};
}
