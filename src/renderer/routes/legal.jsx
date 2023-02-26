function Legal() {
  return (
    <div className="flex h-full w-full flex-col bg-rose-200">
      <div className="my-12 flex items-center justify-between px-12">
        <h1 className="text-3xl font-bold">About us... us being me! ☝️</h1>
      </div>
      <div className="flex-col bg-white border-y-2 p-12 flex items-start gap-12 justify-between">
        <p>
          I&#39;m Arnaud Ambroselli, indiehacker and creator of 💋 Kiss my Invoices.
          <br />
          I&#39;m a French citizen, software developer and I love to build things.
        </p>
        <p>
          My company is located in the Netherlands, because I live in this crazy city of Amsterdam. It&#39;s registered
          as
          <br />
          <b>A.J.M. AMBROSELLI</b>
          <br />
          Goudsbloemstraat 35D
          <br />
          1015JJ Amsterdam
          <br />
          KvK: 88631273
          <br />
          VAT: NL004636768B16
        </p>
        <p>
          The code of Kiss my Invoices is open source and available on{" "}
          <a
            className="underline"
            href="https://github.com/ambroselli-io/kiss-my-invoices"
            target="_blank"
            rel="noreferrer"
          >
            https://github.com/ambroselli-io/kiss-my-invoices
          </a>
          <br />
          It&#39;s licenced under the GNU AGPL Licence that you can read{" "}
          <a
            className="underline"
            href="https://github.com/ambroselli-io/kiss-my-invoices/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
        </p>
        <p>
          Kiss my Invoices is a free software for now, but as soon as I have positive feedbacks and time to setup the
          payment system, it won&#39;t be free anymore 😄
          <br />
          In my dreams, Kiss my Invoices would be 60€ for lifetime access, and I'd like to give 10% of this amount to
          open source funding.
        </p>
        <p>
          If you want to reach me you can{" "}
          <a className="underline" href="mailto:arnaud@ambroselli.io">
            email me
          </a>
          , follow me on{" "}
          <a className="underline" href="https://twitter.com/ambroselli_io" target="_blank" rel="noreferrer">
            Twitter
          </a>{" "}
          or{" "}
          <a
            className="underline"
            href="https://github.com/ambroselli-io/kiss-my-invoices/issues/new/choose"
            target="_blank"
            rel="noreferrer"
          >
            open an issue on Github
          </a>
        </p>
      </div>
    </div>
  );
}

export default Legal;
