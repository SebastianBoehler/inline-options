import Container from "./ui/Container";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white py-6 text-xs text-gray-500">
      <Container className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="leading-relaxed">
          Data sourced from <a
            href="https://www.sg-zertifikate.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-700 hover:text-gray-900"
          >
            SG Zertifikate
          </a>
        </p>
        <p className="leading-relaxed sm:text-right">
          This information is provided for research and educational purposes only and does not constitute investment, financial, or trading advice.
        </p>
      </Container>
    </footer>
  );
}
