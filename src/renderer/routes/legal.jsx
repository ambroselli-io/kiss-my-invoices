function Legal() {
  return (
    <div className="flex h-full w-full flex-col bg-rose-200">
      <div className="my-12 flex items-center justify-between px-12">
        <h1 className="text-3xl font-bold">Legal</h1>
      </div>
      <div className="flex-col bg-white border-y-2 p-12 flex items-start gap-12 justify-between">
        <p>I&#39;m Arnaud Ambroselli, indiehacker and creator of Kiss my Invoices.</p>
        <p>
          I&#39;m a French citizen, living in the Netherlands. I&#39;m a software developer and I love to build things.
        </p>
        <p>My company is located in the Netherlands, because I live in this crazy city of Asmterdam.</p>
        <p>
          The registration of my company is:
          <br />
          A.J.M. AMBROSELLI
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
        </p>
        <p>It's licenced under the</p>
      </div>
    </div>
  );
}

export default Legal;
