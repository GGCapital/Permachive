// import Bundlr from "@bundlr-network/client"
// import tmp, { fileSync } from "tmp-promise"
// import * as p from "path"
// import { mkdir, unlink } from "fs/promises";
// import { PathLike, promises, readFileSync } from "fs";
// import { createWriteStream } from "fs";
// import { getPage, navigatePageSimple } from './lib/puppeteer-setup';
// import axios from "axios"
// import Article from "./Article";
// import fs from "fs";
// import { compress } from "compress-images";


// let TPS = 0;
// let pTPS = 0
// setInterval(() => {
//     console.log(`TPS: ${TPS} - pTPS: ${pTPS}`); TPS = 0; pTPS = 0
// }, 1000)

// const checkPath = async (path: PathLike): Promise<boolean> => { return promises.stat(path).then(_ => true).catch(_ => false) }

// let twitter
// let bundlr
// let article: Article;


// async function main() {

//     const config = JSON.parse(readFileSync("config.json").toString());
//     const keys = JSON.parse(readFileSync(config.walletPath).toString());


//     bundlr = new Bundlr(config.bundlrNode, "arweave", keys.arweave)
//     article = new Article(config)

//     //await processTweet(tweet)

//     const trackKeyWords = config.keywords
//     // const trackUsers = config.userIDs

// }




// async function processPost(post) {
//     let tmpdir;
//     const page = await getPage();

//     try {

//         // const tags = [
//         //     { name: "Application", value: "Permachive - Facebook Archiver" },
//         //     { name: "Tweet-ID", value: `${tweet.id_str}` },
//         //     { name: "Author-ID", value: `${tweet.user.id_str}` },
//         //     { name: "Author-Name", value: `${tweet.user.name}` },
//         //     { name: "Author-Handle", value: `@${tweet.user.screen_name}` },
//         //     { name: "Content-Type", value: "image/png" },
//         //     { name: "Key-Word-List", value: "Ethiopia" },
//         //     { name: "Tweet-Content", value: JSON.stringify(tweet) }
//         // ];

//         if (tweet?.in_reply_to_status_id) {
//             tags.push({ name: "In-Response-To-ID", value: `${tweet.in_reply_to_status_id_str}` })
//         }

//         if (tweet?.extended_entities?.media?.length > 0) {
//             try {
//                 if (!tmpdir) {
//                     tmpdir = await tmp.dir({ unsafeCleanup: true })
//                 }
//                 const mediaDir = p.join(tmpdir.path, "media")
//                 if (!await checkPath(mediaDir)) {
//                     await mkdir(mediaDir)
//                 }
//                 for (let i = 0; i < tweet.extended_entities.media.length; i++) {
//                     const mobj = tweet.extended_entities.media[i]
//                     const url = mobj.media_url
//                     if ((mobj.type === "video" || mobj.type === "animated_gif") && mobj?.video_info?.variants) {
//                         const variants = mobj?.video_info?.variants.sort((a, b) => ((a.bitrate ?? 1000) > (b.bitrate ?? 1000) ? -1 : 1))
//                         await processMediaURL(variants[0].url, mediaDir, i)
//                     } else {
//                         await processMediaURL(url, mediaDir, i)
//                     }
//                 }
//             } catch (e) {
//                 console.error(`while archiving media: ${e.stack}`)
//             }

//         }

//         if (tweet.entities.urls?.length > 0) {
//             try {
//                 for (let i = 0; i < tweet.entities.urls.length; i++) {
//                     const u = tweet.entities.urls[i]
//                     const url = u.expanded_url
//                     // tweets sometimes reference themselves
//                     if (url === `https://twitter.com/i/web/status/${tweet.id_str}`) {
//                         continue;
//                     }
//                     if (!tmpdir) {
//                         tmpdir = await tmp.dir({ unsafeCleanup: true })
//                     }
//                     const headres = await axios.head(url).catch((e) => {
//                         console.log(`heading ${url} - ${e.message}`)
//                     })
//                     if (!headres) { continue }
//                     const contentType = headres.headers["content-type"]?.split(";")[0]?.toLowerCase() ?? "text/html"
//                     const linkPath = p.join(tmpdir.path, `/links/${i}`)
//                     if (!await checkPath(linkPath)) {
//                         await mkdir(linkPath, { recursive: true })
//                     }
//                     // if it links a web page:
//                     if (contentType === "text/html") {
//                         // add to article DB.
//                         console.log(`giving ${url} to Article`)
//                         await article.addUrl(url)
//                     } else {
//                         await processMediaURL(url, linkPath, i)
//                     }
//                 }
//             } catch (e) {
//                 console.error(`While processing URLs: ${e.stack ?? e.message}`)
//             }

//         }
//         // if the tweet had some attachments, upload the tmp folder containing said media/site snapshots.
//         if (tmpdir) {
//             // upload dir
//             const mres = await bundlr.uploader.uploadFolder(tmpdir.path, null, 10, false, async (_) => { })
//             if (mres && mres != "none") {
//                 tags.push({ name: "Media-Manifest-ID", value: `${mres}` })
//                 console.log(`https://node2.bundlr.network/tx/${mres}/data`)
//             }

//             // clean up manifest and ID file.
//             const mpath = p.join(p.join(tmpdir.path, `${p.sep}..`), `${p.basename(tmpdir.path)}-manifest.json`)
//             if (await checkPath(mpath)) {
//                 await unlink(mpath);
//             }
//             const idpath = p.join(p.join(tmpdir.path, `${p.sep}..`), `${p.basename(tmpdir.path)}-id.txt`)
//             if (await checkPath(idpath)) {
//                 await unlink(idpath);
//             }

//             await tmpdir.cleanup()
//         }
//         var url = ("https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str);
//         console.log("Uploading...");

//         // await navigatePageSimple(page, url, { waitFor: 10000 });
//         await page.goto(url, { waitUntil: 'networkidle2' });
//         await new Promise(res => setTimeout(res, 1000 * 10));

//         await page.screenshot({ path: `${tweet.id_str}.png`, fullPage: true });
//         // Code for file compression to cut costs,
//         //this library didn't work so I'll need to do more research to find another

//         // var filename;
//         // if ((fs.statSync(`${tweet.id_str}.png`).size / 1024) > 100) {
//         //     console.log("File above 100kb, compressing....");
//         //     const result = await compress({
//         //         source: `${tweet.id_str}.png`,
//         //         destination: `${tweet.id_str}-compressed.png`,
//         //         enginesSetup: {
//         //             png: { engine: 'pngquant', command: ['--quality=20-50', '-o'] },
//         //         }
//         //     });
//         //     console.log(result);
//         //     filename = `${tweet.id_str}-compressed.png`
//         // } else {
//         //     filename = `${tweet.id_str}.png`
//         // }
//         // const data = fs.readFileSync(filename);

//         const data = fs.readFileSync(`${tweet.id_str}.png`);
//         const tx = await bundlr.createTransaction(data, { tags: tags })
//         await tx.sign();
//         await tx.upload()

//         page.browser().disconnect();
//         // fs.unlinkSync(`${tweet.id_str}.png`);
//         console.log("Complete")
//         pTPS++

//     } catch (e) {
//         fs.unlinkSync(`${tweet.id_str}.png`);
//         page.browser().disconnect();

//         console.log(`general error: ${e.stack ?? e.message}`)
//         if (tmpdir) {
//             await tmpdir.cleanup()
//         }
//     }
// }


// export async function processMediaURL(url: string, dir: string, i: number) {
//     return new Promise(async (resolve, reject) => {
//         const ext = url?.split("/")?.at(-1)?.split(".")?.at(1)?.split("?").at(0) ?? "unknown"
//         const wstream = createWriteStream(p.join(dir, `${i}.${ext}`))
//         const res = await axios.get(url, {
//             responseType: "stream"
//         }).catch((e) => {
//             console.log(`getting ${url} - ${e.message}`)
//         })
//         if (!res) { return }
//         await res.data.pipe(wstream) // pipe to file
//         wstream.on('finish', () => {
//             resolve("done")
//         })
//         wstream.on('error', (e) => {
//             reject(e)
//         })
//     })

// }
// main();