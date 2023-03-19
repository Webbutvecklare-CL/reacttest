import React from "react";
import MarkdownRender from "../components/MarkdownRender";
import { getContentData } from "../utils/contents";

export default function VFU({ contents }) {
  return (
    <div id="contentbody">
      <h1>VFU</h1>
      <article>
        <MarkdownRender mdData={contents["vfu"]} />
      </article>
    </div>
  );
}

export async function getStaticProps() {
  let contents = getContentData("vfu");
  return {
    props: {
      contents,
    }, // will be passed to the page component as props
  };
}
