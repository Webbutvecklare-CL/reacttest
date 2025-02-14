import { app } from "@/firebase/clientApp";
import { getDownloadURL, getStorage, listAll, ref } from "firebase/storage";
const storage = getStorage(app);

async function getAllImages() {
	// returnerar ett promise så att vi kan invänta resultatet
	return new Promise((resolve, reject) => {
		// Referens till mappen med alla bilder för TV:n
		const tvImagesRef = ref(storage, "tv/");

		// Hämtar alla referenser till bilderna
		listAll(tvImagesRef).then((res) => {
			// Hämtar varje url från varje bildreferens/item
			const { items } = res;
			const urlsPromises = items.map((imageRef) => getDownloadURL(imageRef));
			Promise.all(urlsPromises)
				.then((urls) => resolve(urls))
				.catch((err) => {
					console.error(err);
					reject([]);
				});
		});
	});
}

function getGr8anOpen() {
	// Kollar om klockan är mellan 03-06 (Gråttans öppettider)
	const now = new Date().getHours();
	if (now > 3 && now < 6) {
		return false;
	}
	return true;
}

/** assumes array elements are primitive types
 * check whether 2 arrays are equal sets.
 * @param  {} a1 is an array
 * @param  {} a2 is an array
 * by https://stackoverflow.com/a/55614659
 */
function areArraysEqualSets(a1, a2) {
	const superSet = {};
	for (const i of a1) {
		const e = i + typeof i;
		superSet[e] = 1;
	}

	for (const i of a2) {
		const e = i + typeof i;
		if (!superSet[e]) {
			return false;
		}
		superSet[e] = 2;
	}

	for (const e in superSet) {
		if (superSet[e] === 1) {
			return false;
		}
	}

	return true;
}

export { getAllImages, areArraysEqualSets, getGr8anOpen };
