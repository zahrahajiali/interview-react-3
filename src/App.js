import { useRef, useEffect, useState } from "react";

function SearchResults({ results, containerClassName }) {
  return (
    <ul className={containerClassName}>
      {results.map(({ name }) => (
        <li
          key={name}
          className="border-b border-b-[#F5F5F5] p-3 cursor-pointer hover:bg-[#E5F1FF] list-none select-none"
        >
          {name}
        </li>
      ))}
    </ul>
  );
}

function FakeSpan({ textValue, setFakeSpanDomWidth }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const newWidth = getComputedStyle(ref.current).width;
      setFakeSpanDomWidth(newWidth);
    }
  }, [textValue]);

  return (
    <span ref={ref} className="invisible absolute whitespace-pre">
      {textValue}
    </span>
  );
}

function FeaturefulSearchInput({
  serviceSearchInputValue,
  setServiceSearchInputValue,
  serviceSearchResults,
}) {
  const [fakeSpanDomWidth, setFakeSpanDomWidth] = useState("100%");
  const [suggestionInputPlaceholder, setSuggestionInputPlaceholder] =
    useState("");

  const inputRef = useRef(null);

  const handleSearchInputChange = (e) => {
    const value = e.currentTarget.value;
    setServiceSearchInputValue(value);
  };

  let firstSearchItemText = serviceSearchResults[0]?.name
    ? serviceSearchResults[0].name
    : "";

  let isInputValueSubstrinOfFirstSearchItem =
    serviceSearchInputValue ===
    firstSearchItemText.substring(0, serviceSearchInputValue.length);

  useEffect(() => {
    const newPlaceholder = isInputValueSubstrinOfFirstSearchItem
      ? firstSearchItemText
      : "";

    setSuggestionInputPlaceholder(newPlaceholder);
  }, [serviceSearchInputValue, serviceSearchResults]);

  let shouldInputExpand =
    fakeSpanDomWidth === "0px" || suggestionInputPlaceholder.length === 0;

  return (
    <div className="flex w-full">
      <div className="flex justify-between items-center w-full relative overflow-hidden">
        <div
          className="absolute h-full bg-white"
          style={{ width: shouldInputExpand ? "100%" : fakeSpanDomWidth }}
        />

        <input
          ref={inputRef}
          type_="search"
          className="absolute outline-none text-gray-700"
          style={{ width: "100%", backgroundColor: "transparent" }}
          value={serviceSearchInputValue}
          onChange={handleSearchInputChange}
          placeholder="به چه خدمتی نیاز دارید؟"
        />

        <FakeSpan
          textValue={serviceSearchInputValue}
          setFakeSpanDomWidth={setFakeSpanDomWidth}
        />

        <input
          placeholder={suggestionInputPlaceholder}
          className="w-full outline-none"
          focusable="false"
        />
      </div>
    </div>
  );
}

export default function ServiceSearch() {
  const [serviceSearchInputValue, setServiceSearchInputValue] = useState("");
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);

  useEffect(() => {
    fetch("/api/services?zoneId=1").then((res) =>
      res.json().then((s) => setServices(s))
    );
  }, []);

  useEffect(() => {
    const results = services.filter((s) =>
      s.name.includes(serviceSearchInputValue)
    );

    if (serviceSearchInputValue.trim() !== "") {
      setFilteredServices(results);
    } else {
      setFilteredServices([]);
    }
  }, [serviceSearchInputValue]);

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-white z-[99999] cursor-default">
      <div className="px-3 py-7 max-w-96 m-auto">
        <div className="relative flex items-center w-full shadow-sm rounded-md">
          <div className="flex flex-col justify-center w-full relative">
            <div className="flex items-center p-3 border-gray-200 border rounded-lg h-12">
              <FeaturefulSearchInput
                serviceSearchInputValue={serviceSearchInputValue}
                setServiceSearchInputValue={setServiceSearchInputValue}
                serviceSearchResults={filteredServices}
              />
            </div>
            <span className="absolute left-0 self-center h-9 w-0 border-r-[1px] border-gray-200" />
          </div>
          <SearchResults
            containerClassName="bg-white overflow-auto z-10 mt-12 top-0 max-h-72 absolute w-full border border-[#EAECED] rounded-b-md shadow-sm scrollbar-minimal"
            results={filteredServices}
          />
        </div>
      </div>
    </div>
  );
}
